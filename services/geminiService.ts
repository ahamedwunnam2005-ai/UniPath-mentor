
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Feedback, University, Mentor, UserProfile, Scholarship, ApplicationStep } from "../types";

export class GeminiService {
  private cache: Map<string, any> = new Map();

  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private async getWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.cache.has(key)) return this.cache.get(key);
    const result = await fetcher();
    this.cache.set(key, result);
    return result;
  }

  async generateVisionImage(user: UserProfile): Promise<string> {
    const ai = this.getAI();
    const prompt = `A cinematic, photorealistic, and inspiring image of a student named ${user.name || 'a scholar'} from ${user.country || 'abroad'} celebrating their graduation day at a prestigious university in ${user.targetMajor || 'their field of study'}. The background shows a beautiful European or North American campus, bright sunlight, and a sense of triumph and global achievement. High-quality photography, professional lighting.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Vision generation failed");
  }

  async generateRoadmap(profile: Partial<UserProfile>): Promise<ApplicationStep[]> {
    const ai = this.getAI();
    const prompt = `Create a personalized university application roadmap for a student with the following profile:
    Name: ${profile.name}
    Major: ${profile.targetMajor}
    Country: ${profile.country}
    GPA: ${profile.gpa}
    
    Generate 6 distinct, actionable steps. Include specific requirements like English tests if the student is from a non-English speaking country, or specific portfolio tasks if they are in creative fields.
    For each step, include an official URL ('link') to the relevant platform (e.g., https://www.commonapp.org for essays, https://www.collegeboard.org for SAT, https://www.ets.org/toefl for TOEFL, etc.).
    Return an array of objects with fields: id, title, status (always 'pending'), dueDate (YYYY-MM-DD, spaced out over the next 12 months), urgency ('low', 'medium', or 'high'), and link (the official URL).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              status: { type: Type.STRING },
              dueDate: { type: Type.STRING },
              urgency: { type: Type.STRING },
              link: { type: Type.STRING, description: "Official application or registration URL" }
            },
            required: ['id', 'title', 'status', 'dueDate', 'urgency']
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Roadmap generation failed, falling back to defaults", e);
      return [];
    }
  }

  async parseProfileFromText(text: string): Promise<Partial<UserProfile>> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract academic profile data from this text: "${text}". 
      Return JSON with: name, country, gpa, targetMajor, bio. 
      If a field isn't found, return null for it.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            country: { type: Type.STRING },
            gpa: { type: Type.STRING },
            targetMajor: { type: Type.STRING },
            bio: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }

  async getUniversityInsights(universityName: string, region: string): Promise<string> {
    const key = `insight-${universityName}-${region}`;
    return this.getWithCache(key, async () => {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide 3 brief "insider" insights for an international student from Africa applying to ${universityName}. Focus: Aid, culture, major.`,
      });
      return response.text || "No insights available.";
    });
  }

  async connectToMentorLive(mentor: Mentor, callbacks: any) {
    const ai = this.getAI();
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { 
            prebuiltVoiceConfig: {
              voiceName: mentor.id.includes('m1') ? 'Puck' : 'Kore' 
            }
          },
        },
        systemInstruction: `You are ${mentor.name} from ${mentor.origin}, currently studying ${mentor.major} at ${mentor.university}. 
        You are acting as a peer mentor. Tone: Encouraging, knowledgeable, friendly, and concise. 
        You should help the student with specific advice about ${mentor.university} and their ${mentor.major} program. 
        Respond in short, conversational sentences suitable for a real-time voice call.`,
      },
    });
  }

  async getMentorChatStream(mentor: Mentor, message: string) {
    const ai = this.getAI();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are ${mentor.name}, student at ${mentor.university}. Peer mentor helping with application tips.`,
      }
    });
    return chat.sendMessageStream({ message });
  }

  encodeAudio(data: Float32Array): { data: string, mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return {
      data: btoa(binary),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  decodeAudio(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const numChannels = 1;
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  }
  
  async analyzeDocument(docType: string, content: string): Promise<Feedback> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this ${docType}: "${content}". Return JSON: score, suggestions, strengths, rubricScores, revisions.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  }

  async createChat() {
    const ai = this.getAI();
    return ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are the 'Admissions Mentor' assistant.",
      }
    });
  }

  async fetchExternalUniversities(query: string) {
    const ai = this.getAI();
    const searchResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find official website domains and apply portals for top universities matching "${query}".`,
      config: { tools: [{ googleSearch: {} }] }
    });

    const structureResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Convert to JSON array from: "${searchResponse.text}". Fields: name, location, rank, tags, region, country, applyUrl, domain.`,
      config: { responseMimeType: "application/json" }
    });

    try {
      const unis = JSON.parse(structureResponse.text || "[]");
      if (!Array.isArray(unis)) return [];
      return unis.map((u: any, idx: number) => ({
        ...u,
        id: `ext-${Date.now()}-${idx}`,
        isExternal: true,
        logoUrl: u.domain ? `https://logo.clearbit.com/${u.domain}` : undefined
      }));
    } catch (e) {
      return [];
    }
  }

  async getSmartMatches(profile: any) {
    const ai = this.getAI();
    const searchContext = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search web for top universities and CURRENT scholarship opportunities for a student from ${profile.country}, Major: ${profile.field}, Weighted GPA: ${profile.gpa}. 
      Find OFFICIAL website links, application portals, and current international student admission statistics.`,
      config: { tools: [{ googleSearch: {} }] }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Based on the real-time search context: "${searchContext.text}", recommend 3 universities and 2 specific scholarships for this profile: ${JSON.stringify(profile)}. 
      
      For Universities, provide full data so they can be tracked in the app.
      For Scholarships, provide official portal links.
      
      MANDATORY: You MUST discover and include a verified 'applyUrl' (official website/portal) for EVERY university and scholarship.
      
      Return valid JSON.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            universities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  location: { type: Type.STRING },
                  state: { type: Type.STRING },
                  rank: { type: Type.NUMBER },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  imageUrl: { type: Type.STRING },
                  financialAidType: { type: Type.STRING },
                  isCommonApp: { type: Type.BOOLEAN },
                  region: { type: Type.STRING },
                  country: { type: Type.STRING },
                  applyUrl: { type: Type.STRING },
                  probability: { type: Type.NUMBER },
                  type: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                  strategy: { type: Type.STRING },
                  isAlternative: { type: Type.BOOLEAN }
                },
                required: ["name", "location", "applyUrl", "probability", "reasoning", "strategy"]
              }
            },
            scholarships: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  probability: { type: Type.NUMBER },
                  amount: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  whyFit: { type: Type.STRING },
                  applyUrl: { type: Type.STRING },
                  isExternal: { type: Type.BOOLEAN }
                },
                required: ["name", "probability", "amount", "applyUrl"]
              }
            }
          },
          required: ["universities", "scholarships"]
        }
      }
    });
    
    try {
      const parsed = JSON.parse(response.text || "{}");
      return {
        universities: Array.isArray(parsed.universities) ? parsed.universities : [],
        scholarships: Array.isArray(parsed.scholarships) ? parsed.scholarships : [],
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => (c as any).web).filter(Boolean) || []
      };
    } catch (e) {
      console.error("Smart match parsing error", e);
      return { universities: [], scholarships: [], sources: [] };
    }
  }

  async searchUniversitiesWeb(query: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Admissions guide for: "${query}".`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(chunk => (chunk as any).web).map(chunk => ({
      uri: (chunk as any).web?.uri || '',
      title: (chunk as any).web?.title || 'Official Source'
    })) || [];
    return { text: response.text || "", sources };
  }

  async searchScholarshipsWeb(query: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Official scholarships for: "${query}".`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(chunk => (chunk as any).web).map(chunk => ({
      uri: (chunk as any).web?.uri || '',
      title: (chunk as any).web?.title || 'Official Source'
    })) || [];
    return { text: response.text || "", sources };
  }

  async getScholarshipAdvice(scholarshipName: string): Promise<string> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `3 winning tips for applying to the "${scholarshipName}".`,
    });
    return response.text || "";
  }

  async getNetworkAdvice(networkName: string, major: string): Promise<string> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Networking strategy for ${major} student at ${networkName}.`,
    });
    return response.text || "";
  }

  async fetchExternalScholarships(query: string): Promise<Scholarship[]> {
    const ai = this.getAI();
    const searchResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Official scholarships for: "${query}". Search for detailed eligibility, essay requirements, and funding breakdown if possible.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const structureResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Convert to JSON array from: "${searchResponse.text}". Fields: name, provider, amount, deadline, focus, description, region, applyUrl, eligibility (array), essayRequirements (array), fundingBreakdown (string).`,
      config: { responseMimeType: "application/json" }
    });
    try {
      const schs = JSON.parse(structureResponse.text || "[]");
      if (!Array.isArray(schs)) return [];
      return schs.map((s: any, idx: number) => ({ ...s, id: `ext-sch-${Date.now()}-${idx}`, isExternal: true }));
    } catch (e) {
      return [];
    }
  }
}

export const geminiService = new GeminiService();
