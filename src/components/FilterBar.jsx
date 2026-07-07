import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';

const types = ["放デイ", "児発", "放デイ・児発"];
const acceptedChildrenOptions = ["1歳未満", "～2歳児", "3～5歳児", "小学生", "中学生", "高校生等"];
const initiativeOptions = ["集団療育", "個別療育", "ソーシャルスキル", "運動訓練", "言語訓練", "学習支援", "その他"];

function FilterBar({ filters, setFilters }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-collapse on mobile devices by default
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth <= 768) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const handleTypeChange = (e) => {
    setFilters({ ...filters, type: e.target.value });
  };

  const toggleArrayFilter = (filterKey, value) => {
    const currentArray = filters[filterKey] || [];
    if (currentArray.includes(value)) {
      setFilters({
        ...filters,
        [filterKey]: currentArray.filter(v => v !== value)
      });
    } else {
      setFilters({
        ...filters,
        [filterKey]: [...currentArray, value]
      });
    }
  };

  // Count active filters
  const activeFiltersCount = 
    (filters.type ? 1 : 0) + 
    filters.acceptedChildren.length + 
    filters.initiatives.length;

  return (
    <div className="filter-bar">
      <div 
        className="filter-header" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', marginBottom: isExpanded ? '1.5rem' : '0' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={20} />
          <h2 style={{ margin: 0 }}>{t('filters')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}</h2>
        </div>
        <div className="filter-toggle-icon" style={{ color: 'var(--text-muted)' }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="filter-content" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="filter-section">
            <h3>{t('type')}</h3>
            <select value={filters.type} onChange={handleTypeChange} className="type-select">
              <option value="">{t('all')}</option>
              {types.map(type => (
                <option key={type} value={type}>{t(type)}</option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <h3>{t('acceptedChildren')}</h3>
            <div className="chips-container">
              {acceptedChildrenOptions.map(option => (
                <button
                  key={option}
                  className={`chip ${filters.acceptedChildren.includes(option) ? 'active' : ''}`}
                  onClick={() => toggleArrayFilter('acceptedChildren', option)}
                >
                  {t(option)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>{t('initiatives')}</h3>
            <div className="chips-container">
              {initiativeOptions.map(option => (
                <button
                  key={option}
                  className={`chip ${filters.initiatives.includes(option) ? 'active' : ''}`}
                  onClick={() => toggleArrayFilter('initiatives', option)}
                >
                  {t(option)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterBar;
