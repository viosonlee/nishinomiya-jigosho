import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, MapPin, Phone, Mail, Globe, Heart } from 'lucide-react';

function ServiceDetailModal({ service, onClose, isFavorite, onToggleFavorite }) {
  const { t, i18n } = useTranslation();

  if (!service) return null;

  const serviceName = service["事業所名"];
  const favorited = isFavorite(serviceName);

  const handleMapClick = () => {
    const address = `${service["住所（町名）"] || ""}${service["住所（町名以下）"] || ""}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  // List of fields to display, grouped
  const renderField = (key, value, isLink = false) => {
    if (value === null || value === undefined || value === "") return null;
    
    // For boolean-like fields marked with '〇'
    const displayValue = value === "〇" ? "✅" : (isLink ? value : (typeof value === 'string' && value !== '〇' && t(value) !== value ? t(value) : value));

    return (
      <div className="detail-row" key={key}>
        <span className="detail-label">{t(key)}</span>
        <span className="detail-value">
          {isLink ? (
            <a href={value.startsWith('http') ? value : `mailto:${value}`} target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          ) : (
            displayValue
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-top-actions">
          <button
            className={`modal-favorite-btn ${favorited ? 'favorited' : ''}`}
            onClick={() => onToggleFavorite(serviceName)}
            title={favorited
              ? (i18n.language === 'ja' ? 'お気に入りから削除' : '取消收藏')
              : (i18n.language === 'ja' ? 'お気に入りに追加' : '添加收藏')
            }
          >
            <Heart size={20} className={favorited ? 'heart-filled' : ''} />
          </button>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-header">
          <h2>{serviceName}</h2>
          <span className="tag type-tag">{t(service["種別"] || "")}</span>
        </div>

        <div className="modal-body">
          <div className="detail-card">
            <h3>基本情報</h3>
            {renderField("中学校区", service["中学校区"])}
            
            <div className="detail-row">
              <span className="detail-label">{t("住所")}</span>
              <span className="detail-value address-link" onClick={handleMapClick}>
                <MapPin size={16} />
                {`${service["住所（町名）"] || ""}${service["住所（町名以下）"] || ""}`}
              </span>
            </div>
            
            {service["電話番号"] && (
              <div className="detail-row">
                <span className="detail-label">{t("電話番号")}</span>
                <span className="detail-value flex-icon">
                  <Phone size={16} />
                  <a href={`tel:${service["電話番号"]}`}>{service["電話番号"]}</a>
                </span>
              </div>
            )}
            
            {service["メールアドレス"] && (
              <div className="detail-row">
                <span className="detail-label">{t("メールアドレス")}</span>
                <span className="detail-value flex-icon">
                  <Mail size={16} />
                  {renderField("メールアドレス", service["メールアドレス"], true)}
                </span>
              </div>
            )}
            
            {service["ホームページ"] && (
              <div className="detail-row">
                <span className="detail-label">{t("ホームページ")}</span>
                <span className="detail-value flex-icon">
                  <Globe size={16} />
                  {renderField("ホームページ", service["ホームページ"], true)}
                </span>
              </div>
            )}
          </div>

          <div className="detail-card">
            <h3>{t("acceptedChildren")}</h3>
            <div className="grid-2-col">
              {renderField("1歳未満", service["1歳未満"])}
              {renderField("～2歳児", service["～2歳児"])}
              {renderField("3～5歳児", service["3～5歳児"])}
              {renderField("小学生", service["小学生"])}
              {renderField("中学生", service["中学生"])}
              {renderField("高校生等", service["高校生等"])}
            </div>
            <div className="mt-2">
              {renderField("重症心身障害児の受入", service["重症心身障害児の受入"])}
              {renderField("医療的ケア児の受入", service["医療的ケア児の受入"])}
            </div>
          </div>

          <div className="detail-card">
            <h3>{t("initiatives")}</h3>
            <div className="grid-2-col">
              {renderField("集団療育", service["集団療育"])}
              {renderField("個別療育", service["個別療育"])}
              {renderField("ソーシャルスキル", service["ソーシャルスキル"])}
              {renderField("運動訓練", service["運動訓練"])}
              {renderField("言語訓練", service["言語訓練"])}
              {renderField("学習支援", service["学習支援"])}
              {renderField("その他", service["その他"])}
            </div>
            {renderField("「その他」の内容", service["「その他」の内容"])}
          </div>

          <div className="detail-card">
            <h3>その他条件</h3>
            {renderField("利用時は保護者同伴", service["利用時は保護者同伴"])}
            {renderField("送迎の実施", service["送迎の実施"])}
            <div className="days-row">
               {["月", "火", "水", "木", "金", "土", "日", "祝"].map(day => (
                 service[day] === "〇" && <span key={day} className="day-badge">{t(day)}</span>
               ))}
            </div>
            {renderField("備考", service["備考"])}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetailModal;
