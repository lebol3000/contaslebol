
import React, { useState, useRef } from 'react';
import { Transaction, TransactionType, TransactionScope, ExpenseNature, ExpenseCategory } from '../types';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI, Type } from "@google/genai";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface CardInfo {
  cardNumber?: string;
  cardHolder?: string;
  cardBrand?: string;
  institution?: string;
  owner?: string;
}

interface ImportModalProps {
  onImport: (transactions: Omit<Transaction, 'id'>[]) => void;
  onClose: () => void;
  availableCards: CardInfo[];
}

const ImportModal: React.FC<ImportModalProps> = ({ onImport, onClose, availableCards }) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(-1);
  const [vencimento, setVencimento] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const extractTextFromExcel = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    let fullText = '';
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      fullText += json.map((row: any) => row.join('\t')).join('\n') + '\n';
    });
    return fullText;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (selectedCardIndex === -1) {
      setError('Por favor, selecione um cartão primeiro.');
      return;
    }

    if (!vencimento) {
      setError('Por favor, selecione a data de vencimento da fatura.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      ) {
        text = await extractTextFromExcel(file);
      } else {
        throw new Error('Formato de arquivo não suportado. Use PDF ou Excel.');
      }

      if (!text.trim()) {
        throw new Error('Não foi possível extrair texto do arquivo.');
      }

      // Use Gemini to parse the text
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise o seguinte texto extraído de uma fatura de cartão de crédito e extraia as transações (compras). 
        Retorne APENAS um array JSON de objetos com as propriedades: date (formato YYYY-MM-DD), description (empresa favorecida), amount (número positivo).
        Ignore pagamentos de fatura, estornos ou créditos, foque apenas em compras/débitos.
        Texto da fatura:
        ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER }
              },
              required: ["date", "description", "amount"]
            }
          }
        }
      });

      const parsedTransactions = JSON.parse(response.text);
      const selectedCard = availableCards[selectedCardIndex];

      const newTransactions: Omit<Transaction, 'id'>[] = parsedTransactions.map((tx: any) => ({
        description: tx.description,
        amount: Math.abs(tx.amount),
        vencimento: vencimento, // A data de vencimento da fatura informada pelo usuário
        pagamento: vencimento, // Assume que se está na fatura, será pago no vencimento
        category: ExpenseCategory.OUTROS,
        parcela: '1',
        totalParcelas: '1',
        nature: ExpenseNature.EVENTUAL,
        type: TransactionType.EXPENSE,
        scope: TransactionScope.CREDIT_CARD,
        owner: selectedCard.owner || 'Leandro',
        cardNumber: selectedCard.cardNumber,
        cardHolder: selectedCard.cardHolder,
        cardBrand: selectedCard.cardBrand,
        institution: selectedCard.institution
      }));

      if (newTransactions.length === 0) {
        throw new Error('Nenhuma transação encontrada no arquivo.');
      }

      onImport(newTransactions);
      onClose();
    } catch (err: any) {
      console.error('Erro na importação:', err);
      setError(err.message || 'Erro ao processar o arquivo. Tente novamente.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Importar Fatura</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Selecione o Cartão</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={selectedCardIndex}
                onChange={(e) => setSelectedCardIndex(Number(e.target.value))}
              >
                <option value="-1">Escolha um cartão cadastrado...</option>
                {availableCards.map((card, idx) => (
                  <option key={idx} value={idx}>
                    {card.institution} - {card.cardBrand} (**** {card.cardNumber?.slice(-4)}) - {card.owner}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Vencimento da Fatura</label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
              />
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-10 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer relative"
                 onClick={() => fileInputRef.current?.click()}>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-slate-600 animate-pulse">Lendo fatura e extraindo dados...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Clique para IMPORTAR FATURA</p>
                    <p className="text-xs text-slate-400 mt-1">Formatos suportados: PDF ou EXCEL</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {error}
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
              disabled={isLoading}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
