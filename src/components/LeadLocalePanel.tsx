import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Loader2, Globe } from 'lucide-react';
import { api } from '../api';
import type { Lead } from '../types';
import { CLIENT_LANGUAGES, CLIENT_LANGUAGES_PHASE2 } from '../i18n/languages';

const SOURCE_APPS = [
  { id: 'bridge-builder' as const, labelKey: 'leads.bridgeBuilder' },
  { id: 'echo-scale' as const, labelKey: 'leads.echoScale' },
];

export default function LeadLocalePanel() {
  const { t } = useTranslation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    preferredLocale: 'auto',
    sourceApp: 'bridge-builder' as Lead['sourceApp'],
    acceptLanguage: '',
  });

  const refresh = useCallback(async () => {
    try {
      setLeads(await api.getLeads());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.addLead({
        name: form.name,
        email: form.email || undefined,
        company: form.company || undefined,
        preferredLocale: form.preferredLocale === 'auto' ? null : form.preferredLocale,
        sourceApp: form.sourceApp,
        acceptLanguage: form.acceptLanguage || undefined,
      });
      setForm({ name: '', email: '', company: '', preferredLocale: 'auto', sourceApp: 'bridge-builder', acceptLanguage: '' });
      setShowForm(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleLocaleChange = async (leadId: string, locale: string | null) => {
    await api.setLeadLocale(leadId, locale);
    await refresh();
  };

  const allLanguages = [...CLIENT_LANGUAGES, ...CLIENT_LANGUAGES_PHASE2];

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-money-400" size={24} />
      </div>
    );
  }

  return (
    <div className="card border-blue-600/20 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Users size={18} className="text-blue-400" />
            {t('leads.title')}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{t('leads.subtitle')}</p>
          <p className="text-xs text-gray-500 mt-1">{t('leads.overrideNote')}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-secondary flex items-center gap-2 text-sm">
          <Plus size={16} /> {t('leads.addLead')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-3 p-4 bg-dark-800/50 rounded-lg">
          <input className="input" placeholder={`${t('leads.name')} *`} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <input className="input" placeholder={t('leads.email')} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <input className="input" placeholder={t('leads.company')} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          <select className="input" value={form.sourceApp} onChange={e => setForm(f => ({ ...f, sourceApp: e.target.value as Lead['sourceApp'] }))}>
            {SOURCE_APPS.map(a => (
              <option key={a.id} value={a.id}>{t(a.labelKey)}</option>
            ))}
          </select>
          <select className="input" value={form.preferredLocale} onChange={e => setForm(f => ({ ...f, preferredLocale: e.target.value }))}>
            <option value="auto">{t('leads.autoDetect')}</option>
            {allLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.nativeName}</option>
            ))}
          </select>
          <input className="input" placeholder={t('leads.acceptLanguage')} value={form.acceptLanguage} onChange={e => setForm(f => ({ ...f, acceptLanguage: e.target.value }))} />
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {t('leads.saveLead')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">{t('common.cancel')}</button>
          </div>
        </form>
      )}

      {leads.length === 0 ? (
        <p className="text-center text-gray-500 py-6 text-sm">{t('leads.noLeads')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-2">{t('leads.colName')}</th>
                <th className="text-left py-2">{t('leads.colApp')}</th>
                <th className="text-left py-2">{t('leads.colLocale')}</th>
                <th className="text-left py-2">{t('leads.colResolved')}</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-b border-gray-800/50 hover:bg-dark-800/30">
                  <td className="py-3">
                    <p className="font-medium text-white">{lead.name}</p>
                    {lead.email && <p className="text-xs text-gray-500">{lead.email}</p>}
                  </td>
                  <td className="py-3 text-gray-400 capitalize">
                    {lead.sourceApp === 'bridge-builder' ? t('leads.bridgeBuilder') : t('leads.echoScale')}
                  </td>
                  <td className="py-3">
                    <select
                      className="input text-xs py-1"
                      value={lead.preferredLocale ?? 'auto'}
                      onChange={e => handleLocaleChange(lead.id, e.target.value === 'auto' ? null : e.target.value)}
                    >
                      <option value="auto">{t('leads.autoDetect')}</option>
                      {allLanguages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.nativeName}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3">
                    <span className="flex items-center gap-1 text-money-400 text-xs">
                      <Globe size={12} />
                      {lead.resolvedLocale ?? lead.preferredLocale}
                      {lead.localeSource && <span className="text-gray-600">({lead.localeSource})</span>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
