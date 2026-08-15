import React, { useEffect, useState } from "react";

import bcrypt from "bcryptjs";

import LoginRegister from "../../layouts/loginRegister/LoginRegister";
import { useNavigate } from "react-router-dom";

import { isEmpty, isNil } from "lodash";

import { Button, Col, Row } from "react-bootstrap";
import { Input, Spin } from "antd";
import { Link } from "react-router-dom";
import { simpleAlertTimer } from "../../helpers/alerts";
import { User, Mail, Lock, ArrowLeftCircle, CheckCircle, Type } from "lucide-react";
import { getStorageArr, getStorageObj, saveStorage } from "../../helpers/storagesFunc";
import { generateRandomId } from "../../helpers/randomId";
import { loginDataT, userT } from "../../typesInterfaces/types";
import { namesStorage } from "../../initData/namesStorage";

const userInit: userT = {
  picture: '',
  typeUser: "Estudiante",
  user: "",
  email: "",
  password: "",
  id: "",
  name: "",
  lastName: "",
  favorites: [],
  subscriptions: [],
  card:[
    // {
    //   cardNumber: "",
    //   cvv: "",
    //   date: "",
    //   nameOwner: "",
    // }
  ],
};

const Register = () => {
  const [inputsValues, setInputsValues] = useState(userInit);
  const [confirmPassInput, setConfirmPassInput] = useState("");
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const NAVIGATE = useNavigate();

  const handleInputs = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputsValues({
      ...inputsValues,
      [e.target.id]: e.target.value,
    });
  };

  const checkEmailExist = (emailUser: userT["email"]): boolean => {
    let response = false;
    const users: userT[] = getStorageArr({
      name: namesStorage.usersStorage,
    });

    // porque no hay usuarios, osea que el email no existiría
    if (isEmpty(users) === true || isNil(users) === true) {
      response = false;
    }

    if (isEmpty(users) === false) {
      const emailFound = users.some((u) => u.email === emailUser);
      response = emailFound;
    }

    return response;
  };

  const checkInputs = (inputs: userT): boolean => {
    let response: boolean = false;

    //que la inputs no sea nulo ni obj vacío
    if (isNil(inputs) === true || isEmpty(inputs) === true) {
      simpleAlertTimer({
        width: 400,
        title: "Todos los campos son obligatorios",
        icon: "error",
      });
      return response;
    }

    // que todos los inputs tengan valor necesarios tengan valor
    const valuesArr = [
      inputs.email,
      inputs.password,
      inputs.user,
      inputs.name,
      inputs.lastName,
    ];

    if (valuesArr.every((v) => v.trim() !== "") === false) {
      simpleAlertTimer({
        width: 400,
        title: "Todos los campos son obligatorios",
        icon: "error",
      });
      return response;
    }

    //contraseña con mínimo de 8 caráteres
    if (inputs.password.length < 8) {
      simpleAlertTimer({
        width: 400,
        title: "Contraseña de mínimo 8 caráteres",
        icon: "warning",
      });
      return response;
    }

    // revisar si el usuario ya existe mediante el email
    if (checkEmailExist(inputs.email) === true) {
      simpleAlertTimer({
        title: "Este email ya ha sido registrado",
        icon: "info",
      });
      return response;
    }

    //que ambas contraseñas sean iguales
    if (inputs.password !== confirmPassInput) {
      simpleAlertTimer({
        width: 400,
        title: "No coinciden las contraseñas",
        icon: "error",
      });
      return response;
    }

    // todo ok, ya todos los campos tienen valor, contraseñas cumplen las reglas y son iguales...
    response = true;

    return response;
  };

  const handleResetForm = () => {
    setInputsValues(userInit);
  };

  const hashPassword = (): string => {
    const salt = bcrypt.genSaltSync(8);
    const newPass = bcrypt.hashSync(inputsValues.password, salt);

    return newPass;
  };

  const handleRegister = (): void => {
    // revisar que los inputs sean válidos

    const isFormValid = checkInputs(inputsValues);
    if (isFormValid === false) {
      return;
    }

    setShowLoader(true);
    const newUser = inputsValues;

    // agregar hash al password y sustituirla
    const hashPass = hashPassword();
    newUser.password = hashPass;

    // generar un id al usuario
    newUser.id = generateRandomId();

    // guardar en localStorage
    const users = getStorageArr({ name: namesStorage.usersStorage });
    users.push(newUser);

    saveStorage({
      name: namesStorage.usersStorage,
      value: JSON.stringify(users),
    });

    // agregamos un loader que simule guardar en una base
    setTimeout(() => {
      setShowLoader(false);
      handleResetForm();
      simpleAlertTimer({
        title: "Registro con éxito",
        icon: "success",
      });
      NAVIGATE("/login");
    }, 1500);
  };


    // PARA VER SI ESTA LOGUEADO ALGUIEN...
    useEffect(() => {

      const authInfoStorage: loginDataT = getStorageObj({
        name: namesStorage.loginDataStorage
      }) as loginDataT;
  
      if (isNil(authInfoStorage) === true || isEmpty(authInfoStorage) === true) {
        return;
      }
  
      if(authInfoStorage.login === true) {
        NAVIGATE(`/${authInfoStorage.idUser}`);
      }
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  return (
    <>
      <LoginRegister>
        <Spin spinning={showLoader} tip="cargando...">
          <div className="login-inputs">
            {/* IMAGE */}
            <div className="img-login-right mx-auto" />
            {/* TITLE LOGIN */}
            <div>
              <h3 className="text-center text-primary">Online Academy</h3>
              <p className="text-center">Registro</p>
            </div>

          

            {/* FULLNAME INPUT LOGIN */}
            <Row className="justify-content-between">
              <Col md={5} className="">
                {/* NAME INPUT LOGIN*/}
                <Input
                  type="text"
                  autoComplete="off"
                  placeholder="*Nombre"
                  id="name"
                  value={inputsValues.name}
                  size="large"
                  addonAfter={<Type size={18} className="text-success" />}
                  onChange={handleInputs}
                />
              </Col>
              <Col md={6}>
                {/* NAME INPUT LOGIN*/}
                <Input
                  type="text"
                  autoComplete="off"
                  placeholder="*Apellidos"
                  id="lastName"
                  value={inputsValues.lastName}
                  size="large"
                  addonAfter={<Type size={18} className="text-success" />}
                  onChange={handleInputs}
                />
              </Col>
            </Row>

            {/* USER INPUT LOGIN*/}
            <div className="mt-3">
              <Input
                type="text"
                autoComplete="off"
                placeholder="*Usuario"
                id="user"
                value={inputsValues.user}
                size="large"
                addonAfter={<User size={18} className="text-success" />}
                onChange={handleInputs}
              />
            </div>

            {/* EMAIL INPUT LOGIN*/}
            <div className="mt-3">
              <Input
                type="text"
                autoComplete="off"
                placeholder="*example@example.com"
                id="email"
                value={inputsValues.email}
                size="large"
                addonAfter={<Mail size={18} className="text-success" />}
                onChange={handleInputs}
              />
            </div>
            {/* PASSWORD INPUT LOGIN */}
            <div className="mt-3">
              <Input
                type="password"
                autoComplete="off"
                placeholder="*contraseña"
                id="password"
                value={inputsValues.password}
                size="large"
                addonAfter={<Lock size={18} className="text-success" />}
                onChange={handleInputs}
              />
            </div>
            {/* CONFIRM PASSWORD INPUT LOGIN */}
            <div className="mt-3">
              <Input
                type="password"
                autoComplete="off"
                placeholder="*confimar contraseña"
                id="confirmPassword"
                value={confirmPassInput}
                size="large"
                addonAfter={<Lock size={18} className="text-success" />}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setConfirmPassInput(e.target.value);
                }}
              />
            </div>

            {/* BUTTONS LOGIN */}
            <div className="mt-3 d-flex justify-content-evenly ">
              <Button
                variant="outline-danger"
                className="d-flex align-items-center"
                onClick={() => {
                  handleResetForm();
                  const loginLink = document.getElementById("returnLoginBtn");
                  if (isNil(loginLink) === false) {
                    loginLink.click();
                  }
                }}
              >
                <ArrowLeftCircle size={16} className="me-2" />
                Regresar
                <Link
                  to={"/login"}
                  className="d-none"
                  id="returnLoginBtn"
                ></Link>
              </Button>

              <Button variant="success" className="d-flex align-items-center" onClick={handleRegister}>
                <CheckCircle size={16} className="me-2" />
                Registrar
              </Button>
            </div>

            <div className="text-center">
                  <button className='btn btn-link'>
                      <Link to={'/'} >Continuar sin sesión</Link>
                  </button>
                </div>
          </div>
        </Spin>
      </LoginRegister>
    </>
  );
};

export default Register;
