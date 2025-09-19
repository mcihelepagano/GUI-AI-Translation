import React, { useState } from "react";
import {
  Navbar,
  Nav,
  Form,
  FormControl,
  Button,
  Container,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import { Link} from "react-router";
import beer from '../assets/BEER.png'
import beverage from '../assets/BEVERAGE.png'
import water from '../assets/WATER.png'

export default function Homepage() {

  return (
    <main>
      {/* Hero Section */}
      <Container fluid>
        <Row className="py-5 mt-5 light-bg">
          <Col>
            <Row>
              <Col>
                <h1 className="blue-text text-center fw-bold titles">
                  TAPPATRICI PERSONALIZZATE PER QUALSIASI ESIGENZA DI CHIUSURA
                </h1>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className="blue-text text-center m-0">
                  Oltre 700 tappatrici consegnate ogni anno e oltre 25.000 installate in una vasta gamma di settori,
                  da 1.000 a 100.000 BPH, fanno di AROL il più grande specialista di soluzioni personalizzate per
                  qualsiasi esigenza di tappatura.
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mb-5">
          <Col className="text-center">
            <h2 className="my-10 blue-text fw-bold titles">TROVA LA TAPPATRICE PER IL TUO PRODOTTO</h2>
            <Container>
              <Row className="mx-5">
                <Col xs={4}>
                  <Link to="/article" className="text-decoration-none">
                    <h3 className="blue-text">BEVANDE</h3>
                    <img src={beverage} className="w-100"></img>
                  </Link>
                </Col>
                <Col xs={4}>
                  <Link to="/article" className="text-decoration-none">
                    <h3 className="blue-text">BIRRA</h3>
                    <img src={beer} className="w-100"></img>
                  </Link>
                </Col>
                <Col xs={4}>
                  <Link to="/article" className="text-decoration-none">
                    <h3 className="blue-text">ACQUA</h3>
                    <img src={water} className="w-100"></img>
                  </Link>
                </Col>
              </Row>
            </Container>
          </Col>
        </Row>
        <Row>
          <Col>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
