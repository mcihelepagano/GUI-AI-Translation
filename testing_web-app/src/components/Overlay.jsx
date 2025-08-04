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
  Alert
} from "react-bootstrap";
import { Link, Outlet } from "react-router";
import logo from '../assets/58ce3b62678aa48437e460073067ff4e_arol_wht250.png';
import ATpica from '../assets/Logo_ATpica_invertito_2.png';
import ecovadis from '../assets/Logo-ecovadis-2025-85x85.png';
import ucima from '../assets/ucima_logo_2.jpg';
import powered_by from '../assets/Powered_by.png'

export default function Overlay() {
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  
    const handleCookieResponse = () => {
      setShowCookieBanner(false);
    };
  

  return (
    <>
    <header>
      {/* Top navbar */}
      <Navbar variant="dark" className="fixed-top px-2 dark-bg py-4">
        <div className="w-100 mx-5">
          <Container fluid>
          <Row className="justify-content-evenly">
            <Col xs={4} className="text-center d-flex align-items-center justify-content-center">
              <Navbar.Brand href="#linkedin"><i className="bi bi-linkedin fs-2"></i></Navbar.Brand>
              <Navbar.Brand href="#youtube"><i className="bi bi-youtube fs-1"></i></Navbar.Brand>
            </Col>
            <Col xs={4} className="text-center">
              <Navbar.Brand href="#linkedin"><img src={logo}></img></Navbar.Brand>
            </Col>
            <Col xs={4} className="text-center d-flex justify-content-center">
              <Form className="d-flex align-items-center">
                <FormControl type="search" placeholder="Search" className="me-2"/>
                <Button variant="outline-light"><i className="bi bi-search"></i></Button>
              </Form>
            </Col>
          </Row>
          </Container>
        </div>
      </Navbar>

      {/* Bottom navbar */}
      <Navbar className=" fixed-top px-2 margin-upper-navbar light-bg">
        <Nav className="mx-auto">
          <Link to="/" className="fw-bold blue-text nav-link p-3">HOME</Link>
          <Link to="#settori" className="fw-bold blue-text nav-link p-3">SETTORI</Link>
          <Link to="#postvendita" className="fw-bold blue-text nav-link p-3">POST VENDITA</Link>
          <Link to="#news" className="fw-bold blue-text nav-link p-3">NEWS & EVENTI</Link>
          <Link to="#azienda" className="fw-bold blue-text nav-link p-3">AZIENDA</Link>
          <Link to="#lavoro" className="fw-bold blue-text nav-link p-3">LAVORA CON NOI</Link>
          <Link to="#contatti" className="fw-bold blue-text nav-link p-3">CONTATTI</Link>
        </Nav>
      </Navbar>
    </header>

    <div className="padding-navbar">
      <Outlet/>
    </div>

    <footer>
      <div className="dark-bg">
        <Container fluid>
          <Row>
            <Col className="text-center">
              <img src={logo} style={{ transform: 'scale(0.6)' }}></img>
            </Col>
          </Row>
          <Row>
            <Col className="text-center">
              <p className="text-light small-text">AROL S.P.A. – VIALE ITALIA, 193 - 14053 CANELLI (ASTI) ITALIA - C.F. E P.IVA 03217610967 - REA  AT 108104 - CAP. SOC. € 4.500.000 I.V.</p>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="gray-bg">
        <Container fluid className="py-5">
          <Row>
            <Col xs={3} className="text-center">
              <p className="small-text blue-text fw-bold">MEMBER OF</p>
              <img src={ucima} style={{ height: '70px', marginRight: '1em' }}></img>
              <img src={ATpica} style={{ height: '70px', marginLeft: '1em' }}></img>
            </Col>
            <Col xs={3} className="">
              <p className="small-text blue-text fw-bold m-0">AZIENDA</p>
              <p className="small-text blue-text fw-bold m-0">POST VENDITA</p>
              <p className="small-text blue-text fw-bold m-0">LAVORA CON NOI</p>
            </Col>
            <Col xs={3} className="">
              <p className="small-text blue-text fw-bold m-0">TERMINI & CONDIZIONI</p>
              <p className="small-text blue-text fw-bold m-0">NOTE LEGALI</p>
              <p className="small-text blue-text fw-bold m-0">CODICE ETICO</p>
              <p className="small-text blue-text fw-bold m-0">WHISTLEBLOWING</p>
            </Col>
            <Col xs={3} className="">
              <p className="small-text blue-text fw-bold m-0">CONTATTI</p>
              <p className="small-text blue-text fw-bold m-0">PRIVACY POLICY</p>
              <p className="small-text blue-text fw-bold m-0">COOKIE POLICY</p>
              <p className="small-text blue-text fw-bold m-0">MODIFICA PREFERENZE COOKIE</p>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>

    {/* Cookie banner */}
    {showCookieBanner && (
      <Alert variant="light" className=" shadow-lg position-fixed bottom-0 w-100 z-3 mb-0">
        <Container fluid className="coockie-banner">
          <Row>
            <Col className="justify-content-end text-end">
              <p className="cookie-refuse" onClick={handleCookieResponse}>Rifiuta cookie non necessari ✕</p>
            </Col>
          </Row>
          <Row className="justify-content-between">
            <Col xs={9}>
              <Row>
                <Col>
                  <h3 className="text-body-emphasis fw-bold">Questo sito web raccoglie alcuni dati personali dei visitatori e utenti</h3>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <p className="mb-0">Con il tuo consenso, noi e i nostri partner utilizziamo i cookie e tecnologie simili per archiviare, accedere ed elaborare i dati personali come, ad esempio, 
                  la visita al sito web o la personalizzazione degli annunci. Poiché rispettiamo il tuo diritto alla privacy, è possibile scegliere di non consentire alcuni 
                  tipi di cookie. Clicca su preferenze GDPR per saperne di più.</p>
                </Col>
              </Row>
              <Row className="justify-content-between mb-3">
                <Col>
                  <p className="w-100 fw-bold blue-text mb-0 cookie-refuse">
                    Visualizza la Cookie Policy Completa
                  </p>
                </Col>
                <Col className="d-flex">
                  <p className="w-100 fw-bold blue-text text-end me-2 mb-0">
                    Powered by 
                  </p>
                  <img src={powered_by} className="img-fluid align-self-center"></img>
                </Col>
              </Row>
            </Col>
            <Col xs={3}>
              <Row className="">
                <Col>
                  <Button className="w-100" variant="primary" onClick={handleCookieResponse}>
                    ACCETTA TUTTO
                  </Button>
                </Col>
              </Row>
              <Row className="my-3">
                <Col>
                  <Button className="w-100" variant="outline-primary" onClick={handleCookieResponse}>
                    ACCETTA NECESSARI
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col className="text-center">
                  <p className="w-100 fw-bold blue-text cookie-refuse">
                    Preferenze GDPR
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </Alert>
    )}
    </>
  );
}
