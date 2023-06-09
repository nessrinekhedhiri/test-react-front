import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from "react-select";
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Form, FormGroup, Label, Button, Row, Col,Card, CardBody, CardHeader } from 'reactstrap';
import  {Options,columnsTrades,columnsTicker,customStyles,customTotal} from "../constant/Constant"




const MarketDataComponent = () => {
  const [selectedPair, setSelectedPair] = useState('');
  const [currencyOption, setCurrencyOption] = useState([]);
  const [tickerData, setTickerData] = useState(null);
  const [tradesData, setTrades] = useState([]);
  const [sortedTradesData, setSortedTrades] = useState([]);
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    axios
      .get('https://api.binance.com/api/v3/exchangeInfo')
      .then((response) => {
        setCurrencyOption(
          response.data.symbols.map((info) => {
            return { value: info.symbol, label: info.symbol };
          })
        );
      
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    // Fetch ticker data
    axios
      .get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${selectedPair}`)
      .then((response) => {
        setTickerData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });

    // Fetch recent trades data
    axios
      .get(`https://api.binance.com/api/v3/trades?symbol=${selectedPair}`)
      .then((response) => {
        console.log({response})
        setTrades(response.data);
        setSortedTrades(response.data.slice()); // Create a copy for sorting purposes
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const handleSortOptionChange = (selectedOption) => {
    console.log({selectedOption})
    setSortOption(selectedOption);
    switch (selectedOption) {
      case 'time':
        setSortedTrades([...tradesData].sort((a, b) => a.time - b.time));
        break;
      case 'price':
        setSortedTrades([...tradesData].sort((a, b) => parseFloat(a.price) - parseFloat(b.price)));
        break;
      case 'quantity':
        setSortedTrades([...tradesData].sort((a, b) => parseFloat(a.qty) - parseFloat(b.qty)));
        break;
      default:
        setSortedTrades([...tradesData]);
        break;
    }
    
  };
  const options = {
    paginationSize: 4,
    pageStartIndex: 0,
    firstPageText: 'First',
    prePageText: 'Back',
    nextPageText: 'Next',
    lastPageText: 'Last',
    nextPageTitle: 'First page',
    prePageTitle: 'Pre page',
    firstPageTitle: 'Next page',
    lastPageTitle: 'Last page',
    showTotal: true,
    paginationTotalRenderer: customTotal,
    disablePageTitle: true,
    sizePerPageList: [{
      text: '5', value: 5
    }, {
      text: '10', value: 10
    }, {
      text: 'All', value: sortedTradesData.length
    }] // A numeric array is also available. the purpose of above example is custom the text
  };

  return (
    
    <Card className='p-3'>
        <CardHeader className='d-flex justify-content-center'>Market Data</CardHeader>
        <CardBody>
          <Form>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label for="currencyPair">Currency Pair:</Label>
                  <Select
                    id="currencyPair"
                    value={currencyOption.find((option) => option.value === selectedPair)}
                    options={currencyOption}
                    onChange={(newValue, {action}) => {
                      if (action === "select-option") {
                        setSelectedPair(newValue.value);
                      }
                  }}
                  />
                </FormGroup>
              </Col>
              <Col sm={6} className="d-flex align-items-center justify-content-end">
                <Button type="submit" onClick={onSubmit}>Retrieve Market Data</Button>
              </Col>
            </Row>
       </Form>
    
    {tickerData && (<>  
        <Label for="ticker" className='pt-3'>Ticker Data:</Label>
         <BootstrapTable keyField="symbol" data={Array.of(tickerData)} columns={columnsTicker}  noDataIndication="Table is Empty" />
                  </>   
    )}

   {tradesData.length > 0 && (
  <div>
    <Row className='pt-3'>
      <Col sm={6} className="d-flex align-items-center">
        <Label for="trades">Trades Data:</Label>
      </Col>
      <Col sm={6} className="d-flex align-items-center justify-content-end">
          <Label for="sortOption" className='mr-2'>Sort by:</Label>
          <Select
            styles={customStyles}
            id="sortOption"
            value={Options.find((option) => option.value === sortOption)}
            options={Options}
            onChange={(newValue, {action}) => {
              if (action === "select-option") {
                handleSortOptionChange(newValue.value);
              }
          }}
          />
      </Col>
    </Row>
    <BootstrapTable keyField="id" data={sortedTradesData} columns={columnsTrades} noDataIndication="Table is Empty"  
        pagination={ paginationFactory(options )} />
  </div>
    )}
      </CardBody>
    </Card>
    
  );
};

export default MarketDataComponent;