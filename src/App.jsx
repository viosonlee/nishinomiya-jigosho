import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FilterBar from './components/FilterBar';
import ServiceList from './components/ServiceList';
import ServiceDetailModal from './components/ServiceDetailModal';
import servicesData from './data/services.json';
import { Globe } from 'lucide-react';

// Flatten the data
const allServices = Object.values(servicesData).flat();

function App() {
  const { t, i18n } = useTranslation();
  
  const [filters, setFilters] = useState({
    type: "",
    acceptedChildren: [],
    initiatives: []
  });
  
  const [selectedService, setSelectedService] = useState(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ja' ? 'zh' : 'ja';
    i18n.changeLanguage(newLang);
  };

  const filteredServices = useMemo(() => {
    return allServices.filter(service => {
      // Filter by Type
      if (filters.type && service["種別"] !== filters.type) {
        return false;
      }
      
      // Filter by Accepted Children
      if (filters.acceptedChildren.length > 0) {
        const hasAllChildren = filters.acceptedChildren.every(child => service[child] === "〇");
        if (!hasAllChildren) return false;
      }
      
      // Filter by Initiatives
      if (filters.initiatives.length > 0) {
        const hasAllInitiatives = filters.initiatives.every(init => service[init] === "〇");
        if (!hasAllInitiatives) return false;
      }
      
      return true;
    });
  }, [filters]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>{t('title')}</h1>
          <button className="lang-toggle" onClick={toggleLanguage}>
            <Globe size={18} />
            <span>{i18n.language === 'ja' ? '中文' : '日本語'}</span>
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="layout-grid">
          <aside className="sidebar">
            <FilterBar filters={filters} setFilters={setFilters} />
          </aside>
          
          <section className="content">
            <div className="results-count">
              {filteredServices.length} 件見つかりました
            </div>
            <ServiceList services={filteredServices} onServiceClick={setSelectedService} />
          </section>
        </div>
      </main>

      <ServiceDetailModal 
        service={selectedService} 
        onClose={() => setSelectedService(null)} 
      />
    </div>
  );
}

export default App;
