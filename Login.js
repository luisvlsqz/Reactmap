import React, { Component } from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import { Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row, } from 'reactstrap';
import { link, readdir } from 'fs';
import { translate } from "react-translate";
import { UncontrolledAlert, Alert } from 'reactstrap';
import CoreUIIcons from '../../Icons/CoreUIIcons';
import Bannerl from './Componetes/Banner';


const emailRegex = RegExp(
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

class Login extends Component {
  constructor(props) {
    super(props);
    this.cambiarLenguaje = this.cambiarLenguaje.bind(this);
    localStorage.setItem('autentificado', false);
  }

  state = {
    redirect: false,
    model: {
      correo: '',
      clave: '',
      status: '',
    },
    errors: {
      correo: '',
      clave: ' ',
      activarCorreo: false,
      activarClave: false,
      correoBox: '',
      claveBox: '',
      correoError: true,
      claveError: true,
      errorCache: '',
      initial: '',
      onOff: true
    },
    message: {
      text: '',
      alert: ''
    },
  }


  setValues = (e, field) => {
    const { model } = this.state;
    model[field] = e.target.value;
    this.setState({ model });
    this.evaluar(e, field);
  }

  cambiarLenguaje = (e) => {
    const estado = this.state;
    estado["lenguaje"] = e.target.value;
    this.setState(estado);
    console.log(this.state.lenguaje);
    let url = window.location.href;
    if (this.state.lenguaje === "es") {
      if (url.search('localhost:3000/es') === -1 && url.search('localhost:3000/en') === -1) {
        window.location.href = window.location.href.replace("localhost:3000", "localhost:3000/es");
      } else if (url.search('localhost:3000/en') !== -1) {
        window.location.href = window.location.href.replace("localhost:3000/en", "localhost:3000/es");
      }
    } else if (this.state.lenguaje === "en") {
      if (url.search('localhost:3000/es') === -1 && url.search('localhost:3000/en') === -1) {
        window.location.href = window.location.href.replace("localhost:3000", "localhost:3000/en");
      } else if (url.search('localhost:3000/es') !== -1) {
        window.location.href = window.location.href.replace("localhost:3000/es", "localhost:3000/en");
      }
    }
  }

  evaluar = (e, field) => {

    let errors = this.state.errors;
    let model = this.state.model;
    let spaceRegex = RegExp(/^\s/);

    switch (field) {

      case "correo":

        if (emailRegex.test(model.correo)) {
          errors.correo = '';
          errors.correoBox = '';
          document.documentElement.style.setProperty('--prueba', '#657181');
          errors.correoError = false;
          errors.activarCorreo = false;
        } else {
          errors.correo = 'Dirección de correo electrónico no válido';
          errors.correoBox = 'clave';
          document.documentElement.style.setProperty('--prueba', '#BF1736');
          errors.correoError = true;
          errors.activarCorreo = true;
        }
        if (model.correo == 0) {
          errors.correo = ' ';
          errors.correoBox = '';
          document.documentElement.style.setProperty('--prueba', '#657181');
          errors.correoError = true;
          errors.activarCorreo = false;
          errors.onOff = true;
        } else {
          errors.onOff = false;
        }

        break;

      case 'clave':

        if (model.clave.length < 6 || model.clave.length > 10) {
          errors.clave = 'La clave debe contener de 6 a 10 caracteres';
          errors.claveBox = 'clave';
          document.documentElement.style.setProperty('--prueba', '#BF1736');
          errors.claveError = true;
          errors.activarClave = true;
        } else {
          errors.clave = ' ';
          errors.claveBox = '';
          document.documentElement.style.setProperty('--prueba', '#657181');
          errors.claveError = false;
          errors.activarClave = false;
        }
        if (model.clave == '') {
          document.documentElement.style.setProperty('--prueba', '#657181');
          errors.clave = ' ';
          errors.claveBox = '';
          errors.claveError = true;
          errors.activarClave = false;
        }
        if (spaceRegex.test(model.clave)) {
          errors.clave = 'No puede comenzar con espacio en blanco';
          errors.claveBox = 'clave';
          document.documentElement.style.setProperty('--prueba', '#BF1736');
          errors.claveError = true;
          errors.activarClave = true;
        }
        if (errors.correoError == false && errors.claveError == false && model.clave.length !== 0) {
          errors.correo = '';
          errors.clave = '';
        }

        break;
      default:
        break;
    }
    this.setState({ errors });
  }

  //ruta = general.general.servidor.rutaServidor;
  url = this.ruta + 'login';
  loguear = () => {

    const { model } = this.state;
    let data = {
      correo: model.correo,
      clave: model.clave,
    };
    let body = new FormData();
    body.append('correo', model.correo);
    body.append('clave', model.clave);

    const requestInfo = {
      method: 'POST',
      body: body,
      headers: {}
    };
    var flag = '';
    var responseAnterior;
    fetch(this.url, requestInfo)
      .then(response => response.json())
      .then(response => {
        flag = response.status
        this.setState({ model: { message: response.status } })
        if (flag === '401') {
          this.errorAlert('Datos no válidos, por favor vefique e intente nuevamente!');
          this.setState({ model: { correo: data.correo, clave: data.clave } });
        } else {
          this.Verificado(response)
        }




      })
      .catch(e => {
        this.Verificado(responseAnterior)
        console.log('No existe empresa.....')
      });
  }

  Verificado = (response) => {
    let now = new Date().getTime();
    localStorage.setItem('autentificado', true);
    localStorage.setItem('usuario', response.entity.id);
    localStorage.setItem('rolId', response.entity.id_rol);
    localStorage.setItem('fechaI', now);
    localStorage.setItem('correoUsuario', response.entity.correo);
    localStorage.setItem('rolUsuario', response.entity.id_rol);
    var var1 = ({ ...this.props })

    this.props.history.push('/')
  }

  alertaConfirmar = (response, idEmpresa) => {

  }

  reprogramarCita = (idEmpresa) => {
    let body = new FormData();
    body.append('id_empresa[0]', idEmpresa);
    body.append('accion', 2);

    console.log(idEmpresa)
    const requestInfo = {
      method: 'POST',
      body: body,
      headers: {}
    };
    var flag = '';
    fetch(this.ruta + 'estatusInstrumento', requestInfo)
      .then(response => response.json())
      .then(response => {
        flag = response
        console.log(flag)
      })
    this.loginRedirect()
  }

  loginRedirect() {
    localStorage.clear();
    window.location.href = '/';
  }

  errorAlert = (message) => {
    this.setState({ message: { text: message, alert: 'danger' } });
    this.timerMessage(3000);
  }

  timerMessage = (duration) => {
    setTimeout(() => {
      this.setState({ message: { text: '', alert: '' } })
    }, duration);
  }

  entradaCorreo = () => {
    let error = this.state.errors;
    if (error.activarCorreo == true) {
      document.documentElement.style.setProperty('--prueba', '#BF1736');
    } else {
      document.documentElement.style.setProperty('--prueba', '#657181');
    }
  }

  entradaClave = () => {
    let error = this.state.errors;
    if (error.clave !== ' ') {
      document.documentElement.style.setProperty('--prueba', '#BF1736');
    } else {
      document.documentElement.style.setProperty('--prueba', '#657181');
    }
  }

  correoEnter = (e) => {

    let error = this.state.errors;
    let model = this.state.model;
    clearTimeout(error.initial);

    if (e.keyCode === 13) {
      if (error.correo === '' && error.clave === '') {
        this.loguear();
      } else {
        if (model.correo === '' && model.clave === '') {
          error.errorCache = error.correo;
          error.activarCorreo = true;
          error.correo = 'Este campo es obligatorio';
          document.documentElement.style.setProperty('--prueba', '#BF1736');
          error.correoBox = 'clave';
          this.setState({ error });
          error.initial = setTimeout(this.cerrarErrorCorreo, 4000);
        } else {
          if (model.clave === '' && error.correo === '') {
            error.activarClave = true;
            error.clave = 'Este campo es obligatorio';
            //document.documentElement.style.setProperty('--prueba', '#BF1736');
            error.claveBox = 'clave';
            this.setState({ error });
            error.initial = setTimeout(this.cerrarErrorClave, 4000);
          } else {
            error.errorCache = error.correo;
            error.activarCorreo = true;
            error.correo = 'Este campo es obligatorio';
            document.documentElement.style.setProperty('--prueba', '#BF1736');
            error.correoBox = 'clave';
            this.setState({ error });
            error.initial = setTimeout(this.cerrarErrorCorreo, 4000);
          }
        }
      }
    }
  }

  cerrarErrorCorreo = () => {
    let error = this.state.errors;

    if (error.errorCache !== '') {
      error.activarCorreo = true;
      error.correo = error.errorCache;
      document.documentElement.style.setProperty('--prueba', '#BF1736');
      error.correoBox = 'clave';
      clearTimeout(error.initial);
      this.setState({ error });
    } else {
      error.activarCorreo = false;
      error.correo = ' ';
      document.documentElement.style.setProperty('--prueba', '#657181');
      error.correoBox = '';
      clearTimeout(error.initial);
      this.setState({ error });
    }
    if (error.correo === ' ') {
      error.activarCorreo = false;
      error.correo = ' ';
      document.documentElement.style.setProperty('--prueba', '#657181');
      error.correoBox = '';
      clearTimeout(error.initial);
      this.setState({ error });
    }
  }

  claveEnter = (e) => {
    let error = this.state.errors;
    let model = this.state.errors;
    clearTimeout(error.initial);

    if (e.keyCode === 13) {
      if (error.correo === '' && error.clave === '') {
        this.loguear();
      } else {
        if (error.correo === '') {
          error.errorCache = error.clave;
          error.activarClave = true;
          error.clave = 'Este campo es obligatorio';
          document.documentElement.style.setProperty('--prueba', '#BF1736');
          error.claveBox = 'clave';
          this.setState({ error });
          error.initial = setTimeout(this.cerrarErrorClave, 4000);
        } else {
          error.errorCache = error.clave;
          error.activarClave = true;
          error.clave = 'Este campo es obligatorio';
          document.documentElement.style.setProperty('--prueba', '#BF1736');
          error.claveBox = 'clave';
          this.setState({ error });
          error.initial = setTimeout(this.cerrarErrorClave, 4000);
        }
      }
    }
  }

  cerrarErrorClave = () => {
    let error = this.state.errors;
    let model = this.state.model;

    if (model.clave === '') {
      if (error.correo === '') {
        error.activarClave = false;
        error.clave = ' ';
        document.documentElement.style.setProperty('--prueba', '#657181');
        error.claveBox = '';
        clearTimeout(error.initial);
        this.setState({ error });
      } else {
        error.activarClave = false;
        error.clave = ' ';
        error.claveBox = '';
        clearTimeout(error.initial);
        this.setState({ error });
      }
    } else {
      if (error.errorCache !== '') {
        error.activarClave = true;
        error.clave = error.errorCache;
        document.documentElement.style.setProperty('--prueba', '#BF1736');
        error.claveBox = 'clave';
        clearTimeout(error.initial);
        this.setState({ error });
      } else {
        error.activarClave = false;
        error.clave = ' ';
        document.documentElement.style.setProperty('--prueba', '#657181');
        error.claveBox = '';
        clearTimeout(error.initial);
        this.setState({ error });
      }
      if (error.clave === ' ') {
        error.activarClave = false;
        error.clave = ' ';
        document.documentElement.style.setProperty('--prueba', '#657181');
        error.claveBox = '';
        clearTimeout(error.initial);
        this.setState({ error });
      }
    }
  }


  render() {

    const { errors } = this.state;
    const enabled =
      this.state.errors.correo.length <= 0 &&
      this.state.errors.clave.length <= 0;
    let { t } = this.props;
    return (

      <div className="app flex-row align-items-center">

        <Container>

          {
            this.state.message.text !== '' ? (
              <UncontrolledAlert color={this.state.message.alert} className='text-center' >
                {this.state.message.text}
              </UncontrolledAlert>
            ) : ''
          }

          <Row className="justify-content-center">
            <Col md="5">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>

                    <Bannerl />

                    <Form className="formulario">

                      <br />
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="cui-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input onFocus={this.entradaCorreo} onKeyDown={this.correoEnter} className={this.state.errors.correoBox} type="email" id='correo' placeholder={t("Usuario Correo")} autoComplete="username" onChange={e => this.setValues(e, 'correo')} />
                      </InputGroup>

                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input onKeyDown={this.claveEnter} onFocus={this.entradaClave} className={this.state.errors.claveBox} type="password" id='clave' autoComplete="current-password" placeholder={t("Clave")} maxLength="10" onChange={e => this.setValues(e, 'clave')} disabled={this.state.errors.onOff} />
                      </InputGroup>

                      <Row>
                        <Col xs="6">
                          <Button color="success" className="px-4" onClick={e => this.loguear(e)} disabled={!enabled}>{t('Ingresar')}</Button>
                        </Col>
                        <Col xs="6" className="text-right">
                          <BrowserRouter>
                            <Link className="locuas" to="/Recuperarclave">{t('¿Olvidó su clave?')}</Link>
                          </BrowserRouter>
                        </Col>
                      </Row>
                      <br />
                      <label className="letras">{t('IDIOMA')}</label>
                      <div>
                        <select
                          className="form-control form-control-sm"
                          value={this.state.lenguaje}
                          onChange={this.cambiarLenguaje} name="sele1" id="sele">
                          <option value="1">-----</option>
                          <option value="es">Español</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </Form>
                  </CardBody>
                  <p className="letras">------</p>
                </Card>
              </CardGroup>
              <div>
              </div>
            </Col>

          </Row>


        </Container>

      </div>

    );
  }
}

export default translate('Login')(Login);