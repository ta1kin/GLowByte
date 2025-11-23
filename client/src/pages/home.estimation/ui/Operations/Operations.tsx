import { UIBlock } from '@/shared/ui/Block';
import type { JSX } from 'react';
import { useState } from 'react';

import styles from './Operations.module.scss';
import SvgSettings from '@/shared/assets/icons/settings.svg'

const FREQUENCY1 = [
  { id: '', name: 'Выберите частоту' },
  { id: '1', name: 'Частота 1' },
  { id: '2', name: 'Частота 2' },
  { id: '3', name: 'Частота 3' },
];

const FREQUENCY2 = [
  { id: '', name: 'Выберите частоту' },
  { id: '1', name: 'Частота 1' },
  { id: '2', name: 'Частота 2' },
  { id: '3', name: 'Частота 3' },
];

const MONITORING_SYSTEMS = [
  { id: 'stationary', name: 'Стационарные температурные датчики' },
  { id: 'drone', name: 'Тепловизионные дроны / аэросъемка' },
  { id: 'portable', name: 'Портативные пирометры' },
];

const PREVENTION_SYSTEMS = [
  { id: 'sprinkler', name: 'Система орошения / увлажнения' },
];

const MODES = [
  { id: '', name: 'Выберите режим' },
  { id: 'manual', name: 'Ручной' },
  { id: 'auto', name: 'Автоматический' },
];

function Operations(): JSX.Element {
  const [freq1, setFreq1] = useState<string>('');
  const [freq2, setFreq2] = useState<string>('');
  const [monitoring, setMonitoring] = useState<string[]>([]);
  const [prevention, setPrevention] = useState<string[]>([]);
  const [mode, setMode] = useState<string>('');
  const [frequencyText, setFrequencyText] = useState<string>('');
  const [incident, setIncident] = useState<string>('');

  // Обработчики для чекбоксов
  const handleMonitoringChange = (id: string) => {
    setMonitoring((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handlePreventionChange = (id: string) => {
    setPrevention((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section style={{ width: '100%' }}>
      <UIBlock
        type="green"
        iconSrc=""
        headTxt="Операционные / Технологические параметры"
      >
        <div className={styles['block-body']}>
          <div className={styles['block-body__ctx']}>
            {/* Частота перевалки / переформирования */}
            <div>
              <h4>Частота перевалки / переформирования</h4>
              <select
                className={styles['select-params']}
                value={freq1}
                onChange={(e) => setFreq1(e.target.value)}
                required
              >
                <option value="" disabled hidden>
                  Выберите частоту
                </option>
                {FREQUENCY1.filter((f) => f.id).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Частота измерения температуры */}
            <div>
              <h4>Частота измерения температуры</h4>
              <select
                className={styles['select-params']}
                value={freq2}
                onChange={(e) => setFreq2(e.target.value)}
                required
              >
                <option value="" disabled hidden>
                  Выберите частоту
                </option>
                {FREQUENCY2.filter((f) => f.id).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Системы мониторинга */}
            <div className={styles['full-width']}>
              <h4>Системы мониторинга</h4>
              <div className={styles['checkbox-group']}>
                {MONITORING_SYSTEMS.map((system) => (
                  <div key={system.id} className={styles['checkbox-item']}>
                    <input
                      type="checkbox"
                      id={`monitoring-${system.id}`}
                      checked={monitoring.includes(system.id)}
                      onChange={() => handleMonitoringChange(system.id)}
                      className={styles['checkbox']}
                    />
                    <label htmlFor={`monitoring-${system.id}`} className={styles['checkbox-label']}>
                      {system.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Системы предотвращения */}
            <div className={styles['full-width']}>
              <h4>Системы предотвращения</h4>
              <div className={styles['checkbox-group']}>
                {PREVENTION_SYSTEMS.map((system) => (
                  <div key={system.id} className={styles['checkbox-item']}>
                    <input
                      type="checkbox"
                      id={`prevention-${system.id}`}
                      checked={prevention.includes(system.id)}
                      onChange={() => handlePreventionChange(system.id)}
                      className={styles['checkbox']}
                    />
                    <label htmlFor={`prevention-${system.id}`} className={styles['checkbox-label']}>
                      {system.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Режим и частота */}
            <div>
              <h4>Режим</h4>
              <select
                className={styles['select-params']}
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                required
              >
                <option value="" disabled hidden>
                  Выберите режим
                </option>
                {MODES.filter((m) => m.id).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <h4>Частота</h4>
              <input
                type="text"
                className={styles['select-params']}
                value={frequencyText}
                onChange={(e) => setFrequencyText(e.target.value)}
                placeholder="напр., каждые 6 часов"
              />
            </div>

            {/* Предыдущие инциденты */}
            <div className={styles['full-width']}>
              <h4>Предыдущие инциденты на этом складе</h4>
              <div className={styles['radio-group']}>
                {[
                  { id: 'yes', label: 'Да' },
                  { id: 'no', label: 'Нет' },
                ].map((option) => (
                  <div key={option.id} className={styles['radio-item']}>
                    <input
                      type="radio"
                      id={`incident-${option.id}`}
                      name="incident"
                      value={option.id}
                      checked={incident === option.id}
                      onChange={(e) => setIncident(e.target.value)}
                      className={styles['radio']}
                    />
                    <label htmlFor={`incident-${option.id}`} className={styles['radio-label']}>
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </UIBlock>
    </section>
  );
}

export default Operations;