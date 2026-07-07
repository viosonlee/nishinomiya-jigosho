import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, ChevronRight } from 'lucide-react';

function ServiceList({ services, onServiceClick }) {
  const { t } = useTranslation();

  const handleMapClick = (e, service) => {
    e.stopPropagation();
    const address = `${service["住所（町名）"] || ""}${service["住所（町名以下）"] || ""}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  if (services.length === 0) {
    return (
      <div className="empty-state">
        <p>{t('noData')}</p>
      </div>
    );
  }

  return (
    <div className="service-list">
      {services.map((service, index) => {
        const address = `${service["住所（町名）"] || ""}${service["住所（町名以下）"] || ""}`;
        return (
          <div key={index} className="service-card" onClick={() => onServiceClick(service)}>
            <div className="service-card-content">
              <h3 className="service-title">{service["事業所名"]}</h3>
              <div className="service-address" onClick={(e) => handleMapClick(e, service)}>
                <MapPin size={16} className="map-icon" />
                <span>{address}</span>
              </div>
              <div className="service-tags">
                <span className="tag type-tag">{t(service["種別"] || "")}</span>
              </div>
            </div>
            <div className="service-card-action">
              <ChevronRight size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ServiceList;
