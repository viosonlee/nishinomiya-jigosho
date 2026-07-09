import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FilterBar from './components/FilterBar';
import ServiceList from './components/ServiceList';
import ServiceDetailModal from './components/ServiceDetailModal';
import servicesData from './data/services.json';
import { Globe, Navigation, Loader, X } from 'lucide-react';
import { useGeolocation } from './hooks/useGeolocation';
import { calculateDistance, formatDistance } from './utils/geocoding';

// Flatten the data
const allServices = Object.values(servicesData).flat();

// Pre-defined area coordinates for Nishinomiya addresses
const AREA_COORDINATES = {
  '名塩': { lat: 34.8371, lng: 135.3208 },
  '生瀬': { lat: 34.8319, lng: 135.3249 },
  '塩瀬': { lat: 34.8350, lng: 135.3230 },
  '山口': { lat: 34.8173, lng: 135.2990 },
  '甲東園': { lat: 34.7683, lng: 135.3588 },
  '門戸': { lat: 34.7637, lng: 135.3514 },
  '上ヶ原': { lat: 34.7725, lng: 135.3480 },
  '甲陽園': { lat: 34.7700, lng: 135.3394 },
  '苦楽園': { lat: 34.7650, lng: 135.3320 },
  '夙川': { lat: 34.7461, lng: 135.3283 },
  '西宮北口': { lat: 34.7467, lng: 135.3597 },
  '今津': { lat: 34.7333, lng: 135.3556 },
  '鳴尾': { lat: 34.7260, lng: 135.3680 },
  '甲子園': { lat: 34.7217, lng: 135.3614 },
  '武庫川': { lat: 34.7333, lng: 135.3783 },
  '仁川': { lat: 34.7817, lng: 135.3594 },
  '瓦木': { lat: 34.7561, lng: 135.3700 },
  '津門': { lat: 34.7400, lng: 135.3450 },
  '用海': { lat: 34.7350, lng: 135.3417 },
  '浜脇': { lat: 34.7367, lng: 135.3350 },
  '広田': { lat: 34.7583, lng: 135.3400 },
  '高木': { lat: 34.7500, lng: 135.3500 },
  '大社': { lat: 34.7450, lng: 135.3300 },
  '安井': { lat: 34.7430, lng: 135.3340 },
  '高須': { lat: 34.7200, lng: 135.3750 },
  '南甲子園': { lat: 34.7150, lng: 135.3600 },
  '甲子園口': { lat: 34.7400, lng: 135.3800 },
  '上甲子園': { lat: 34.7350, lng: 135.3700 },
  '段上': { lat: 34.7670, lng: 135.3660 },
  '樋ノ口': { lat: 34.7530, lng: 135.3730 },
  '松山': { lat: 34.7400, lng: 135.3600 },
  '田近野': { lat: 34.7520, lng: 135.3650 },
  '荒木': { lat: 34.7460, lng: 135.3640 },
  '小松': { lat: 34.7390, lng: 135.3580 },
  '下大市': { lat: 34.7620, lng: 135.3570 },
  '上大市': { lat: 34.7680, lng: 135.3550 },
  '神呪': { lat: 34.7670, lng: 135.3520 },
  '能登': { lat: 34.7350, lng: 135.3350 },
  '戸田': { lat: 34.7300, lng: 135.3410 },
  '神祇官': { lat: 34.7480, lng: 135.3350 },
  '池田': { lat: 34.7450, lng: 135.3580 },
  '上鳴尾': { lat: 34.7310, lng: 135.3700 },
  '学文殿': { lat: 34.7280, lng: 135.3650 },
  '里中': { lat: 34.7250, lng: 135.3620 },
  '小曽根': { lat: 34.7230, lng: 135.3680 },
  '笠屋': { lat: 34.7210, lng: 135.3750 },
  '花園': { lat: 34.7380, lng: 135.3560 },
  '中屋': { lat: 34.7370, lng: 135.3530 },
  '柳本': { lat: 34.7360, lng: 135.3500 },
  '分銅': { lat: 34.7410, lng: 135.3420 },
  '与古道': { lat: 34.7420, lng: 135.3440 },
  '産所': { lat: 34.7430, lng: 135.3390 },
  '石在': { lat: 34.7440, lng: 135.3360 },
  '城ヶ堀': { lat: 34.7410, lng: 135.3460 },
  '馬場': { lat: 34.7390, lng: 135.3480 },
  '六湛寺': { lat: 34.7380, lng: 135.3430 },
  '社家': { lat: 34.7430, lng: 135.3310 },
  '越水': { lat: 34.7380, lng: 135.3380 },
  '中前田': { lat: 34.7340, lng: 135.3350 },
  '田中': { lat: 34.7310, lng: 135.3380 },
  '二見': { lat: 34.7340, lng: 135.3520 },
  '松籟荘': { lat: 34.7630, lng: 135.3480 },
  '神原': { lat: 34.7580, lng: 135.3430 },
  '獅子ヶ口': { lat: 34.7590, lng: 135.3460 },
  '若草': { lat: 34.7250, lng: 135.3590 },
  '甲子園浦風': { lat: 34.7170, lng: 135.3600 },
  '甲子園洲鳥': { lat: 34.7180, lng: 135.3630 },
  '甲子園春風': { lat: 34.7190, lng: 135.3580 },
  '甲子園砂田': { lat: 34.7200, lng: 135.3560 },
  '甲子園六番': { lat: 34.7230, lng: 135.3610 },
  '甲子園七番': { lat: 34.7240, lng: 135.3620 },
  '甲子園八番': { lat: 34.7250, lng: 135.3640 },
  '甲子園九番': { lat: 34.7260, lng: 135.3660 },
  '西田': { lat: 34.7420, lng: 135.3530 },
  '両度': { lat: 34.7380, lng: 135.3480 },
  '久出ヶ谷': { lat: 34.7350, lng: 135.3420 },
  '堀切': { lat: 34.7320, lng: 135.3400 },
  '和上': { lat: 34.7380, lng: 135.3400 },
  '丸橋': { lat: 34.7540, lng: 135.3670 },
  '林田': { lat: 34.7480, lng: 135.3640 },
  '平松': { lat: 34.7440, lng: 135.3710 },
  '大畑': { lat: 34.7490, lng: 135.3710 },
  '室川': { lat: 34.7510, lng: 135.3650 },
  '松下': { lat: 34.7460, lng: 135.3730 },
  '小松北': { lat: 34.7420, lng: 135.3590 },
  '小松南': { lat: 34.7370, lng: 135.3570 },
  '小松東': { lat: 34.7400, lng: 135.3610 },
  '小松西': { lat: 34.7390, lng: 135.3550 },
};

/**
 * Find coordinates for a service address using area-based lookup.
 */
function findServiceCoordinates(service) {
  const townName = service['住所（町名）'] || '';
  for (const [area, coords] of Object.entries(AREA_COORDINATES)) {
    if (townName.includes(area)) {
      return coords;
    }
  }
  // Default to Nishinomiya city center
  return { lat: 34.7378, lng: 135.3417 };
}

function App() {
  const { t, i18n } = useTranslation();
  
  const [filters, setFilters] = useState({
    type: "",
    acceptedChildren: [],
    initiatives: []
  });
  
  const [selectedService, setSelectedService] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  
  const { userLocation, locationError, isLocating, requestLocation, clearLocation } = useGeolocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ja' ? 'zh' : 'ja';
    i18n.changeLanguage(newLang);
  };

  const handleDistanceSort = useCallback(() => {
    if (sortByDistance) {
      // Turn off distance sorting
      setSortByDistance(false);
      clearLocation();
    } else {
      // Request location and enable sorting
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
      const coords = findServiceCoordinates(service);
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
    let result = allServices.filter((service, index) => {
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
  }, [filters, sortByDistance, userLocation, serviceDistances]);

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
            <div className="results-header">
              <div className="results-count">
                {filteredServices.length} {i18n.language === 'ja' ? '件見つかりました' : '个结果'}
              </div>
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
            {locationError && (
              <div className="location-error">
                <span>{locationErrorMessage}</span>
              </div>
            )}
            <ServiceList
              services={filteredServices}
              onServiceClick={setSelectedService}
              showDistance={sortByDistance && !!userLocation}
            />
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
