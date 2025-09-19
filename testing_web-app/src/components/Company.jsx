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
import pdf from '../assets/catalogogenerale.png'
import arrow from '../assets/Arrow.png'
import atomHeart from '../assets/AtomHeart.png'
import chessUp from '../assets/ChessUp.png'
import overView from '../assets/OverView.jpg'
import parkinglot from '../assets/ParkingLot.jpg'

export default function Company() {

  return (
    <>
    <Container>
      <Row>
        <Col xs={9}>
          <main>
            {/* Hero Section */}
            <Row className="py-5">
              <Col>
                <h2 className="blue-text bottom-outline">AZIENDA</h2>
              </Col>
            </Row>
            <Row className="mb-5">
              <Col>
                <h3 className="blue-text">SOLUZIONI PERSONALIZZATE PER QUALSIASI ESIGENZA DI TAPPATURA</h3>
                <p className="blue-text">AROL è stata fondata nel 1978 a Canelli ed è cresciuta costantemente come fornitore globale di soluzioni di tappatura. Progettiamo il 100% delle nostre macchine e produciamo internamente +95% dei loro componenti.</p>

                <p className="blue-text">Oltre 700 macchine tappatrici consegnate ogni anno e oltre 25.000 installate in una vasta gamma di settori, da 1.000 a 100.000 BPH, fanno di AROL il più grande specialista di soluzioni di tappatura personalizzate.</p>

                <p className="blue-text">Il supporto tecnico AROL è disponibile per l’intero ciclo di vita della macchina e conta su un team altamente qualificato di specialisti che opera da ciascuno dei nostri 11 uffici in tutto il mondo.</p>
              </Col>
            </Row>
            <Row className="mb-5 light-bg">
              <Col className="text-center">
                <img src={arrow} className="img-fluid icons-company" />
                <h4 className="blue-text">LA NOSTRA MISSIONE</h4>
                <p className="blue-text">Essere il principale fornitore di sistemi di applicazione delle chiusure e di attrezzature per la produzione di tappi su misura e ad alte prestazioni, in grado di offrire qualità eccezionale, sicurezza per i consumatori e un valore senza pari.</p>
              </Col>
              <Col className="text-center">
                <img src={atomHeart} className="img-fluid icons-company" />
                <h4 className="blue-text">I NOSTRI VALORI</h4>
                <p className="blue-text">Accogliere la sfida <br></br>
                                          Rispettare gli impegni<br></br>
                                          Costruire relazioni a lungo termine</p>
              </Col>
              <Col className="text-center">
                <img src={chessUp} className="img-fluid icons-company" />
                <h4 className="blue-text">LE NOSTRE STRATEGIE</h4>
                <p className="blue-text">Attitudine innovativa<br></br>
                                          Prodotti e servizi di altissima qualità<br></br>
                                          Implementare le best practice di diversi settori </p>
              </Col>
            </Row>
            <Row className="mb-5 light-bg g-0" style={{ position: 'relative', left: '-1%' }}>
              <Col xs={6}>
                <div className="white-bg m-3 p-5" style={{ position: 'relative', zIndex: 3 }}>
                  <h4 className="blue-text">I NOSTRI STABILIMENTI</h4>
                  <p className="blue-text mb-0"><strong>PRODUCIAMO INTERNAMENTE + DEL 95% DEI NOSTRI COMPONENTI</strong><br></br>
                                                        L'integrazione verticale di tutta la progettazione e del ciclo produttivo garantisce una flessibilità reale e una qualità costante in ogni fase della produzione.<br></br>
                                                        A Canelli (Asti) AROL può contare su 3 stabilimenti produttivi:<br></br>
                                                        REPARTO MACCHINE UTENSILI (+6500 mq.)<br></br>
                                                        UFFICI, MONTAGGIO E MAGAZZINO (+20.000 mq.)<br></br>
                                                        MONTAGGIO COMPONENTI E ALIMENTATORI (5.500 mq.) <br></br></p>
                </div>
              </Col>
              <Col className="text-center" xs={6}>
              <div style={{right: '+10%', position: 'relative', backgroundPosition: 'center center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', width: '115%', height: '100%'}}>
                <img src={overView} className="img-fluid icons-company h-100 w-100"/>
              </div>
              </Col>
            </Row>
          </main>
        </Col>
        <Col xs={3}>
          <aside>
            <Row className="py-5">
              <Col className="light-bg py-2">
                <h2 className="blue-text">DOWNLOAD PDF</h2>
                <img src={pdf} className="img-fluid" />
              </Col>
            </Row>
          </aside>
        </Col>
      </Row>
    </Container>
    </>
  );
}
