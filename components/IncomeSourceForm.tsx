import React, { useState } from 'react';
import { IncomeSource, IncomeSourceType } from '../types';

interface IncomeSourceFormProps {
  onSave: (source: IncomeSource) => void;
  onClose: () => void;
  editingSource?: IncomeSource | null;
}

export const IncomeSourceForm: React.FC<IncomeSourceFormProps> = ({ onSave, onClose, editingSource }) => {
  const [formData, setFormData] = useState<Omit<IncomeSource, 'id'>>({
    type: editingSource?.type || IncomeSourceType.EMPRESA_ORGAO,
    name: editingSource?.name || '',
    document: editingSource?.document || '',
    address: editingSource?.address || '',
    admissionDate: editingSource?.admissionDate || '',
    position: editingSource?.position || '',
    propertyRegistration: editingSource?.propertyRegistration || '',
    sefazRegistration: editingSource?.sefazRegistration || '',
    value: editingSource?.value || 0,
    installment: editingSource?.installment || '',
    totalInstallments: editingSource?.totalInstallments || '',
    startDate: editingSource?.startDate || '',
    endDate: editingSource?.endDate || '',
    tenantName: editingSource?.tenantName || '',
    tenantCpf: editingSource?.tenantCpf || '',
    tenantPhone: editingSource?.tenantPhone || '',
    guarantorName: editingSource?.guarantorName || '',
    guarantorCpf: editingSource?.guarantorCpf || '',
    guarantorPhone: editingSource?.guarantorPhone || '',
    client: editingSource?.client || '',
    description: editingSource?.description || '',
    receiptDate: editingSource?.receiptDate || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: editingSource?.id || Math.random().toString(36).substr(2, 9),
    } as IncomeSource);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {editingSource ? 'Editar Fonte de Renda' : 'Cadastrar Fonte de Renda'}
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Informações Profissionais e Financeiras</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">FONTE</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as IncomeSourceType })}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 appearance-none bg-white"
              >
                {Object.values(IncomeSourceType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {formData.type === IncomeSourceType.EMPRESA_ORGAO && (
              <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ÓRGÃO OU EMPRESA</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    placeholder="Ex: Ministério da Fazenda ou Tech Corp"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ / CPF</label>
                  <input
                    required
                    type="text"
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ENDEREÇO</label>
                  <input
                    required
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DATA DE ADMISSÃO/POSSE</label>
                    <input
                      required
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CARGO</label>
                    <input
                      required
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                      placeholder="Ex: Analista"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.type === IncomeSourceType.ALUGUEL && (
              <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ENDEREÇO</label>
                  <input
                    required
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MATRÍCULA IMÓVEL</label>
                    <input
                      required
                      type="text"
                      value={formData.propertyRegistration}
                      onChange={(e) => setFormData({ ...formData, propertyRegistration: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">INSCRIÇÃO SEFAZ</label>
                    <input
                      required
                      type="text"
                      value={formData.sefazRegistration}
                      onChange={(e) => setFormData({ ...formData, sefazRegistration: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">VALOR</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PARCELA</label>
                    <input
                      required
                      type="text"
                      value={formData.installment}
                      onChange={(e) => setFormData({ ...formData, installment: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NÚMERO DE PARCELAS</label>
                    <input
                      required
                      type="text"
                      value={formData.totalInstallments}
                      onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">INÍCIO</label>
                    <input
                      required
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TÉRMINO</label>
                    <input
                      required
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LOCATÁRIO</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">NOME</label>
                      <input
                        required
                        type="text"
                        value={formData.tenantName}
                        onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">CPF</label>
                      <input
                        required
                        type="text"
                        value={formData.tenantCpf}
                        onChange={(e) => setFormData({ ...formData, tenantCpf: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">TELEFONE</label>
                      <input
                        required
                        type="text"
                        value={formData.tenantPhone}
                        onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FIADOR</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">NOME</label>
                      <input
                        required
                        type="text"
                        value={formData.guarantorName}
                        onChange={(e) => setFormData({ ...formData, guarantorName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">CPF</label>
                      <input
                        required
                        type="text"
                        value={formData.guarantorCpf}
                        onChange={(e) => setFormData({ ...formData, guarantorCpf: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">TELEFONE</label>
                      <input
                        required
                        type="text"
                        value={formData.guarantorPhone}
                        onChange={(e) => setFormData({ ...formData, guarantorPhone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(formData.type === IncomeSourceType.HONORARIOS || formData.type === IncomeSourceType.PAGAMENTOS_DIVERSOS) && (
              <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CLIENTE</label>
                  <input
                    required
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DESCRIÇÃO</label>
                  <input
                    required
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">VALOR</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DATA RECEBIMENTO</label>
                    <input
                      required
                      type="date"
                      value={formData.receiptDate}
                      onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PARCELA</label>
                    <input
                      required
                      type="text"
                      value={formData.installment}
                      onChange={(e) => setFormData({ ...formData, installment: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TOTAL DE PARCELAS</label>
                    <input
                      required
                      type="text"
                      value={formData.totalInstallments}
                      onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-8 py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all uppercase text-xs tracking-widest"
            >
              {editingSource ? 'Salvar Alterações' : 'Confirmar Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
