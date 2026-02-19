import React from 'react';
import { useI18n } from '../contexts/I18nContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'zh-TW' ? 'en' : 'zh-TW');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
      title={t('common.language')}
    >
      <span className="text-lg">{language === 'zh-TW' ? '🇹🇼' : '🇺🇸'}</span>
      <span className="hidden sm:inline">{t('common.switchLang')}</span>
    </button>
  );
};

export default LanguageToggle;
