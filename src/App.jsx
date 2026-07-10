import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FilterBar from './components/FilterBar';
import ServiceList from './components/ServiceList';
import ServiceDetailModal from './components/ServiceDetailModal';
import servicesData from './data/services.json';
import { getServiceCoordinates } from './data/townCoordinates';
import { Globe, Navigation, Loader, X, Heart, Search } from 'lucide-react';
import { useGeolocation } from './hooks/useGeolocation';
import { useFavorites } from './hooks/useFavorites';
import { calculateDistance } from './utils/geocoding';

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
  const [sortByDistance, setSortByDistance] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { userLocation, locationError, isLocating, requestLocation, clearLocation } = useGeolocation();
  const { toggleFavorite, isFavorite, favoritesCount } = useFavorites();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ja' ? 'zh' : 'ja';
    i18n.changeLanguage(newLang);
  };

  const handleDistanceSort = useCallback(() => {
    if (sortByDistance) {
      setSortByDistance(false);
      clearLocation();
    } else {
      requestLocation();
      setSortByDistance(true);
    }
  }, [sortByDistance, requestLocation, clearLocation]);

  // Reset sortByDistance if location error
  useEffect(() => {
    if (locationError) {
      setSortByDistance(false);
    }
  }, [locationError]);

  // Calculate distances for all services
  const serviceDistances = useMemo(() => {
    if (!userLocation) return new Map();
    
    const distances = new Map();
    allServices.forEach((service, index) => {
      const coords = getServiceCoordinates(service);
      if (coords) {
        const dist = calculateDistance(
          userLocation.lat, userLocation.lng,
          coords.lat, coords.lng
        );
        distances.set(index, dist);
      }
    });
    return distances;
  }, [userLocation]);

  const filteredServices = useMemo(() => {
    // Normalize search query for matching
    const query = searchQuery.trim().toLowerCase();

    let result = allServices.filter((service) => {
      // Filter by favorites
      if (showFavoritesOnly && !isFavorite(service["事業所名"])) {
        return false;
      }

      // Filter by search query (fuzzy match name + address)
      if (query) {
        const name = (service["事業所名"] || '').toLowerCase();
        const town = (service["住所（町名）"] || '').toLowerCase();
        const addr = (service["住所（町名以下）"] || '').toLowerCase();
        const fullAddress = `${town}${addr}`;
        // Check if all space-separated search terms match
        const terms = query.split(/\s+/);
        const matchTarget = `${name} ${fullAddress}`;
        const allMatch = terms.every(term => matchTarget.includes(term));
        if (!allMatch) return false;
      }

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

    // Attach original index for distance lookup, and distance value
    result = result.map(service => {
      const originalIndex = allServices.indexOf(service);
      const distance = serviceDistances.get(originalIndex);
      return { ...service, _distance: distance, _originalIndex: originalIndex };
    });

    // Sort by distance if enabled
    if (sortByDistance && userLocation && serviceDistances.size > 0) {
      result.sort((a, b) => {
        const distA = a._distance ?? Infinity;
        const distB = b._distance ?? Infinity;
        return distA - distB;
      });
    }
    
    return result;
  }, [filters, sortByDistance, userLocation, serviceDistances, showFavoritesOnly, isFavorite, searchQuery]);

  const locationErrorMessage = useMemo(() => {
    if (!locationError) return null;
    const lang = i18n.language;
    const messages = {
      PERMISSION_DENIED: lang === 'ja' ? '位置情報の許可が必要です' : '需要位置信息权限',
      POSITION_UNAVAILABLE: lang === 'ja' ? '位置情報を取得できません' : '无法获取位置信息',
      TIMEOUT: lang === 'ja' ? '位置情報の取得がタイムアウトしました' : '位置信息获取超时',
      GEOLOCATION_NOT_SUPPORTED: lang === 'ja' ? 'この端末では位置情報が使えません' : '此设备不支持位置信息',
      UNKNOWN_ERROR: lang === 'ja' ? '位置情報の取得に失敗しました' : '获取位置信息失败',
    };
    return messages[locationError] || messages.UNKNOWN_ERROR;
  }, [locationError, i18n.language]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>{t('title')}</h1>
          <div className="header-actions">
            <button
              className={`favorites-header-btn ${showFavoritesOnly ? 'active' : ''}`}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              title={i18n.language === 'ja' ? 'お気に入り' : '收藏'}
            >
              <Heart size={18} className={showFavoritesOnly ? 'heart-filled' : ''} />
              {favoritesCount > 0 && (
                <span className="favorites-badge">{favoritesCount}</span>
              )}
            </button>
            <button className="lang-toggle" onClick={toggleLanguage}>
              <Globe size={18} />
              <span>{i18n.language === 'ja' ? '中文' : '日本語'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="layout-grid">
          <aside className="sidebar">
            <FilterBar filters={filters} setFilters={setFilters} />
          </aside>
          
          <section className="content">
            {/* Search bar */}
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder={i18n.language === 'ja' ? '名前・住所で検索...' : '搜索名称或地址...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="results-header">
              <div className="results-count">
                {showFavoritesOnly && (
                  <span className="favorites-label">
                    <Heart size={14} className="heart-filled" />
                    {i18n.language === 'ja' ? 'お気に入り' : '收藏'}
                    {' · '}
                  </span>
                )}
                {filteredServices.length} {i18n.language === 'ja' ? '件見つかりました' : '个结果'}
              </div>
              <div className="results-actions">
                <button
                  className={`distance-sort-btn ${sortByDistance && userLocation ? 'active' : ''}`}
                  onClick={handleDistanceSort}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <>
                      <Loader size={16} className="spin-icon" />
                      <span>{i18n.language === 'ja' ? '取得中...' : '获取中...'}</span>
                    </>
                  ) : sortByDistance && userLocation ? (
                    <>
                      <Navigation size={16} />
                      <span>{i18n.language === 'ja' ? '距離順' : '按距离排序'}</span>
                      <X size={14} className="close-icon" />
                    </>
                  ) : (
                    <>
                      <Navigation size={16} />
                      <span>{i18n.language === 'ja' ? '現在地から近い順' : '按距当前位置排序'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            {locationError && (
              <div className="location-error">
                <span>{locationErrorMessage}</span>
              </div>
            )}
            <ServiceList
              services={filteredServices}
              onServiceClick={setSelectedService}
              showDistance={sortByDistance && !!userLocation}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          </section>
        </div>
      </main>

      <ServiceDetailModal 
        service={selectedService} 
        onClose={() => setSelectedService(null)}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}

export default App;
