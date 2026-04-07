import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { firestoreService } from "./firestoreService";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const addTaskTool: FunctionDeclaration = {
  name: "addTask",
  description: "Add a new task to the task manager",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the task" },
      description: { type: Type.STRING, description: "Detailed description" },
      status: { type: Type.STRING, enum: ["pending", "in-progress", "completed"], description: "Current status" },
      priority: { type: Type.STRING, enum: ["low", "medium", "high"], description: "Priority level" },
      dueDate: { type: Type.STRING, description: "When the task is due (ISO 8601)" }
    },
    required: ["title", "status"]
  }
};

const addEventTool: FunctionDeclaration = {
  name: "addEvent",
  description: "Add a new event to the calendar",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Event title" },
      startTime: { type: Type.STRING, description: "Start time (ISO 8601)" },
      endTime: { type: Type.STRING, description: "End time (ISO 8601)" },
      location: { type: Type.STRING, description: "Where it happens" },
      description: { type: Type.STRING, description: "Event details" }
    },
    required: ["title", "startTime", "endTime"]
  }
};

const addNoteTool: FunctionDeclaration = {
  name: "addNote",
  description: "Add a new note to the knowledge base",
  parameters: {
    type: Type.OBJECT,
    properties: {
      content: { type: Type.STRING, description: "Note content" },
      title: { type: Type.STRING, description: "Note title" },
      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Categorization tags" }
    },
    required: ["content"]
  }
};

const listTasksTool: FunctionDeclaration = {
  name: "listTasks",
  description: "List all tasks",
  parameters: { type: Type.OBJECT, properties: {} }
};

const listEventsTool: FunctionDeclaration = {
  name: "listEvents",
  description: "List all calendar events",
  parameters: { type: Type.OBJECT, properties: {} }
};

const listNotesTool: FunctionDeclaration = {
  name: "listNotes",
  description: "List all notes",
  parameters: { type: Type.OBJECT, properties: {} }
};

const tools = [
  {
    functionDeclarations: [
      addTaskTool,
      addEventTool,
      addNoteTool,
      listTasksTool,
      listEventsTool,
      listNotesTool
    ]
  }
];

export const geminiService = {
  async chat(message: string, history: any[] = []) {
    const contents: any[] = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));
    
    contents.push({ role: 'user', parts: [{ text: message }] });

    let response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: `You are Nexus, a primary orchestrator for a multi-agent AI system. 
        You help users manage their life by coordinating tasks, schedules, and information.
        
        CORE CAPABILITIES:
        1. Task Management: Create, list, and update tasks.
        2. Calendar Management: Create and list events.
        3. Knowledge Management: Create and list notes.
        4. Routine Management: Help users establish and maintain daily routines by combining tasks and events.
        
        YOUR ROLE:
        - When a user asks for something, determine the best tools to use.
        - If a request is complex (e.g., "I want to start a morning routine"), break it down into multiple tool calls (e.g., add recurring tasks, schedule blocks in the calendar, and create a note with the routine details).
        - Be proactive. If a user adds a task with a deadline, suggest scheduling time in the calendar to work on it.
        - Always confirm the specific actions you've taken.
        - If the user asks about their routine, use listTasks and listEvents to provide a summarized view.`,
        tools,
      }
    });

    // Handle function calls loop
    while (response.functionCalls && response.functionCalls.length > 0) {
      // Add model's function call to history
      contents.push({
        role: 'model',
        parts: response.candidates?.[0]?.content?.parts || []
      });

      const toolResults = [];
      for (const call of response.functionCalls) {
        let result;
        try {
          if (call.name === "addTask") {
            result = await firestoreService.addTask(call.args);
          } else if (call.name === "addEvent") {
            result = await firestoreService.addEvent(call.args);
          } else if (call.name === "addNote") {
            result = await firestoreService.addNote(call.args);
          } else if (call.name === "listTasks") {
            result = await firestoreService.getTasks();
          } else if (call.name === "listEvents") {
            result = await firestoreService.getEvents();
          } else if (call.name === "listNotes") {
            result = await firestoreService.getNotes();
          }
          toolResults.push({
            functionResponse: {
              name: call.name,
              response: { result: result || "Success" }
            }
          });
        } catch (error: any) {
          toolResults.push({
            functionResponse: {
              name: call.name,
              response: { error: error.message }
            }
          });
        }
      }
      
      // Add tool results to history
      contents.push({
        role: 'user',
        parts: toolResults
      });

      // Get next response from model
      response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: { tools }
      });
    }

    return response.text || "I've processed your request.";
  }
};
