
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export const getFinancialInsights = async (transactions: Transaction[]): Promise<string> => {
  // Initialize the GoogleGenAI client with the API key from environment variables
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const summary = transactions.map(t => 
    `- ${t.description}: R$${t.amount} (Cat: ${t.category}, Parcela: ${t.parcela}/${t.totalParcelas}, Natureza: ${t.nature}${t.periodicity ? `, Ciclo: ${t.periodicity}` : ''}, Vencimento: ${t.vencimento}, Pagamento: ${t.pagamento})`
  ).join('\n');

  const prompt = `
    Como um consultor financeiro especialista para o aplicativo "CONTAS LEBOL", analise os seguintes gastos domésticos e pessoais e forneça insights curtos e práticos (em 3 tópicos) para economizar ou organizar melhor as contas:

    ${summary}

    Responda em português de forma amigável e direta. Foque na distinção entre gastos rotineiros (Anual, Mensal, Semanal) e eventuais. Comente sobre o peso dos compromissos recorrentes no orçamento.
  `;

  try {
    // Generate content using the recommended gemini-3-flash-preview model
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Correctly accessing the .text property from the response
    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Ops! O consultor IA está ocupado agora. Tente novamente mais tarde.";
  }
};
