import React, { useState, useEffect, useCallback } from 'react';
import { Select } from 'antd';
import axios from 'axios';
import errorHandler from '@/request/errorHandler';

function FilterSearch({
  fields,
  route,
  name,
  placeholder = '',
  selectProps = {},
  otherParams = {},
  value = '_id',
  where = null,
  handleSelect = () => {
    console.log('');
  },
  other = {},
  otherName,
  propClassName = '',
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value) => {
    setLoading(true);
    let params = { q: value, fields, otherParams, where };
    try {
      const res = await axios.get(route, { params });
      const data = res.data.result;
      setOptions(data);
    } catch (error) {
      errorHandler(error);
    } finally {
      setLoading(false);
    }
  };
  const getStatusOption = (Arr) => {
    let newArr = [];
    Arr.map((p) => {
      let Obj = {
        label: `${p[name]} ${otherName ? p[otherName] : ''}`,
        key: p._id,
        value: p._id,
      };
      newArr.push(Obj);
    });
    return newArr;
  };
  return (
    <Select
      showSearch
      placeholder={placeholder}
      // onFocus={handleSearch}
      {...selectProps}
      popupClassName={propClassName}
      onSearch={handleSearch}
      //   onSelect={(value) => handleSelect(value, options, other)}
      notFoundContent={loading ? <span>Loading...</span> : 'Start typing'}
      filterOption={false}
      style={{ width: '100%' }}
      allowClear
      loading={loading}
      options={getStatusOption(options)}
    ></Select>
  );
}

export default FilterSearch;
