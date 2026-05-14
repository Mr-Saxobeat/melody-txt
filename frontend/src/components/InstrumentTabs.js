import React, { useState } from 'react';
import { INSTRUMENTS, getInstrumentById } from '../utils/instruments';
import useTranslation from '../i18n/useTranslation';
import './InstrumentTabs.css';

function InstrumentTabs({ tabs, activeTabId, onTabSelect, onAddTab, onDeleteTab, onSuffixChange }) {
  const [editingSuffix, setEditingSuffix] = useState(null);
  const [suffixValue, setSuffixValue] = useState('');
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const { t } = useTranslation();

  const handleSuffixClick = (tab, e) => {
    e.stopPropagation();
    setEditingSuffix(tab.id);
    setSuffixValue(tab.suffix || '');
  };

  const handleSuffixSave = (tabId) => {
    onSuffixChange(tabId, suffixValue);
    setEditingSuffix(null);
  };

  const handleSuffixKeyDown = (e, tabId) => {
    if (e.key === 'Enter') handleSuffixSave(tabId);
    if (e.key === 'Escape') setEditingSuffix(null);
  };

  const getTabLabel = (tab) => {
    const name = t(`instrument.${tab.instrument}`);
    return tab.suffix ? `${name} - ${tab.suffix}` : name;
  };

  const handleAddClick = () => {
    setShowInstrumentModal(true);
  };

  const handleInstrumentSelect = (instrumentId) => {
    setShowInstrumentModal(false);
    onAddTab(instrumentId);
  };

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <>
      <div className="instrument-tabs">
        {/* Mobile dropdown */}
        <div className="tabs-dropdown">
          <select
            className="tabs-select"
            value={activeTabId || ''}
            onChange={(e) => onTabSelect(e.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {getTabLabel(tab)}
              </option>
            ))}
          </select>
          {tabs.length > 1 && activeTab && (
            <button
              className="tab-delete-mobile"
              onClick={() => onDeleteTab(activeTabId)}
              aria-label={`Delete ${activeTab ? getTabLabel(activeTab) : ''} tab`}
            >
              &times;
            </button>
          )}
          {tabs.length < 10 && (
            <button className="tab-add" onClick={handleAddClick} aria-label="Add instrument tab">
              +
            </button>
          )}
        </div>

        {/* Desktop tabs bar */}
        <div className="tabs-bar">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab-item ${tab.id === activeTabId ? 'active' : ''}`}
              onClick={() => onTabSelect(tab.id)}
            >
              {editingSuffix === tab.id ? (
                <input
                  className="suffix-input"
                  value={suffixValue}
                  onChange={(e) => setSuffixValue(e.target.value)}
                  onBlur={() => handleSuffixSave(tab.id)}
                  onKeyDown={(e) => handleSuffixKeyDown(e, tab.id)}
                  onClick={(e) => e.stopPropagation()}
                  maxLength={50}
                  autoFocus
                />
              ) : (
                <span
                  className="tab-label"
                  onDoubleClick={(e) => handleSuffixClick(tab, e)}
                >
                  {getTabLabel(tab)}
                </span>
              )}
              {tabs.length > 1 && (
                <button
                  className="tab-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTab(tab.id);
                  }}
                  aria-label={`Delete ${getTabLabel(tab)} tab`}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          {tabs.length < 10 && (
            <button className="tab-add" onClick={handleAddClick} aria-label="Add instrument tab">
              +
            </button>
          )}
        </div>
      </div>

      {showInstrumentModal && (
        <div className="instrument-modal-overlay" onClick={() => setShowInstrumentModal(false)}>
          <div className="instrument-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('instrument.selectInstrument')}</h3>
            <div className="instrument-list">
              {INSTRUMENTS.map((inst) => (
                <button
                  key={inst.id}
                  className="instrument-option"
                  onClick={() => handleInstrumentSelect(inst.id)}
                >
                  {t(`instrument.${inst.id}`)} in {inst.key}
                </button>
              ))}
            </div>
            <button className="btn-cancel" onClick={() => setShowInstrumentModal(false)}>
              {t('instrument.cancel')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default InstrumentTabs;
