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
import overcap from '../assets/OVERCAP.jpg'
import pt_flat from '../assets/PRE-THREADED-FLAT-PLASTIC-CAPS.jpg'
import pt_irregular from '../assets/PRE-THREADED-IRREGULAR-GEOMETRY-CAPS-WATER_1.jpg'

export default function Article() {

  return (
    <>
    <Container>
      <Row>
        <Col xs={9}>
          <main>
            {/* Hero Section */}
            <Row className="py-5">
              <Col>
                <h2 className="blue-text bottom-outline">BEVANDE</h2>
              </Col>
            </Row>
            <Row className="mb-5">
              <Col>
                <h3 className="blue-text">Macchine tappatrici automatiche per bevande</h3>
                <p className="blue-text">AROL è il partner ideale per il settore delle bevande, offrendo macchine tappatrici automatiche per la tappatura di una <strong>vasta gamma di prodotti</strong>, tra cui bevande analcoliche gassate e non gassate, bevande energetiche, bevande sportive, prodotti a base di caffè e tè, e bevande nutrizionali. Indipendentemente dal tipo di bevanda, dal formato della bottiglia o dalla dimensione della produzione, AROL propone la tappatrice più adatta ad ogni esigenza. Ogni macchina si adatta perfettamente a qualsiasi tipo di contenitore, che si tratti di <strong>bottiglie in PET, HDPE, vetro o alluminio</strong>, garantendo sempre la massima qualità e l'integrità del prodotto finale.</p>

                <p className="blue-text">AROL progetta macchine tappatrici per bottiglie con un livello di efficienza e precisione elevatissimi, assicurando una tappatura rapida e impeccabile. In aggiunta, AROL offre una <strong>gamma completa di accessori complementari, tra cui elevatori e orientatori</strong>, che facilitano la movimentazione delle capsule e dei tappi durante il processo di imbottigliamento. Inoltre, è possibile integrare sistemi di controllo qualità per garantire il monitoraggio costante della produzione, assicurando che ogni bottiglia rispetti gli standard richiesti.</p>

                <p className="blue-text">L'offerta di AROL si completa con una linea di <strong>detappatrici</strong>, pensate per rimuovere in modo efficace i tappi in plastica, alluminio o corona dalle bottiglie riutilizzabili in vetro e PET, permettendo una gestione completa del processo di tappatura.</p>
              </Col>
            </Row>
            <Row className="mb-5">
              <Col>
                <Row>
                  <Col md={4} className="mb-4 article-column">
                    <div className="product-card">
                      <h5 className="mt-3 blue-text">CAPPUCCIO A PRESSIONE</h5>
                      <img src={overcap} alt="Cappuccio a pressione" className="img-fluid" />
                      <p className="blue-text medium-text">AROL offre tappatrici monotesta o multitesta per l'applicazione di cappucci a pressione su bottiglie in PET o in vetro.</p>
                      <Button variant="primary" size="sm">MACCHINE</Button>
                    </div>
                  </Col>
                  <Col md={4} className="mb-4 article-column">
                    <div className="product-card">
                      <h5 className="mt-3 blue-text">TAPPO IN PLASTICA PRE-FILETTATO FLAT</h5>
                      <img src={pt_flat} alt="Tappo in plastica pre-filettato flat" className="img-fluid" />
                      <p className="blue-text medium-text">AROL gestisce tappi di plastica da 1000 bph a 100.000 bph.</p>
                      <Button variant="primary" size="sm">MACCHINE</Button>
                    </div>
                  </Col>
                  <Col md={4} className="mb-4">
                    <div className="product-card">
                      <h5 className="mt-3 blue-text">TAPPO PRE-FILETTATO IN PLASTICA A GEOMETRIA IRREGOLARE</h5>
                      <img src={pt_irregular} alt="Tappo a geometria irregolare" className="img-fluid" />
                      <p className="blue-text medium-text">Gestiamo qualsiasi tipo di tappo con geometria irregolare, forme insolite o grandi dimensioni.</p>
                      <Button variant="primary" size="sm">MACCHINE</Button>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </main>
        </Col>
        <Col xs={3}>
          <aside>
            <Row className="py-5">
              <Col className="light-bg py-2">
                <h2 className="blue-text">SETTORI</h2>
                <ul className="aside-list">
                  <li><strong>&gt; BEVANDE</strong>
                    <ul>
                      <li><p className="medium-text blue-text">Cappuccio a pressione</p></li>
                      <li><p className="medium-text blue-text">Tappo in plastica pre-filettato flat</p></li>
                      <li><p className="medium-text blue-text">Tappo pre-filettato in plastica a geometria irregolare</p></li>
                      <li><p className="medium-text blue-text">Tappo in plastica pre-filettato sport</p></li>
                      <li><p className="medium-text blue-text">Coperchio a pressione per lattine</p></li>
                      <li><p className="medium-text blue-text">Ring pull</p></li>
                      <li><p className="medium-text blue-text">Tappo in alluminio ropp</p></li>
                      <li><p className="medium-text blue-text">Tappo corona in acciaio</p></li>
                      <li><p className="medium-text blue-text">Tappo a corona in alluminio</p></li>
                      <li><p className="medium-text blue-text">Tappo pre-filettato in plastica per buste</p></li>
                      <li><p className="medium-text blue-text">Capsula Twist off</p></li>
                      <li><p className="medium-text blue-text">Tappo tethered</p></li>
                    </ul>
                  </li>
                  <li><strong className="blue-text">&gt; BIRRA</strong></li>
                  <li><strong className="blue-text">&gt; ACQUA</strong></li>
                  <li><strong className="blue-text">&gt; SUCCHI</strong></li>
                  <li><strong className="blue-text">&gt; LATTICINI</strong></li>
                  <li><strong className="blue-text">&gt; ALIMENTI</strong></li>
                  <li><strong className="blue-text">&gt; OLIO ALIMENTARE</strong></li>
                  <li><strong className="blue-text">&gt; VINO & LIQUORI</strong></li>
                  <li><strong className="blue-text">&gt; INTEGRATORI ALIMENTARI</strong></li>
                  <li><strong className="blue-text">&gt; CURA DELLA PERSONA</strong></li>
                  <li><strong className="blue-text">&gt; CURA DELLA CASA</strong></li>
                  <li><strong className="blue-text">&gt; PRODOTTI CHIMICI</strong></li>
                </ul>
              </Col>
            </Row>
          </aside>
        </Col>
      </Row>
    </Container>
    </>
  );
}
