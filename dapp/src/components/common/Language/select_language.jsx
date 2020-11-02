import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames'
import { useLang } from './lang_provider';

const options = [
  { label: "English", value: "en" },
  { label: "中国酶", value: "zh" },
  { label: "Vietnamese", value: "vi" },
  { label: "Korean", value: "ko" },
];

const SelectLanguage = () => {
  const [isListOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useLang();
  const containerRef = useRef(null);
  const iconRef = useRef(null);
  const toggling = () => setIsOpen(!isListOpen);

  const onOptionClicked = ({ value }) => () => {
    setLang(value);
    setIsOpen(false);
  };
  const handleClickOutside = (e) => {
    if (isListOpen && containerRef.current && !iconRef.current.contains(e.target) && !containerRef.current.contains(e.target))
      setIsOpen(false);
  };

  useEffect(() => {
    if (isListOpen === true) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isListOpen])

  return (
    <React.Fragment>
      <a ref={iconRef} onClick={toggling} rel="noreferrer noopener" className={classNames('icon', 'language')} target='_blank' />
      <div className='dropdown-container'>
        {isListOpen && (
          <div ref={containerRef} className='dropdown-list-container'>
            <ul className='dropdown-list'>
              {options.map((option, index) => (
                <li onClick={onOptionClicked(option)} key={index} className='list-item'>
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

export default SelectLanguage;