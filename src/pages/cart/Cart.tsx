import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Carousel from "next-elastic-carousel";

import "./cart.scss";
import {
  cardT,
  cartT,
  coursesT,
  loginDataT,
  typeUserCategory,
  userT,
} from "../../typesInterfaces/types";
import { isEmpty, isNil } from "lodash";
import { CartContextHook } from "../../context/CartContextProvider";

import emptyImage from "../../assets/looking-courses.svg";
import { Modal, Radio, Spin, Tooltip } from "antd";
import type { RadioChangeEvent } from "antd";
import { simpleAlertTimer } from "../../helpers/alerts";
import { namesStorage } from "../../initData/namesStorage";
import {
  getStorageArr,
  getStorageObj,
  saveStorage,
} from "../../helpers/storagesFunc";
import CreditCard from "../profile/tabs/CreditCard";

import qrImage from "../../assets/qr-code.png";
import payementProcessImg from "../../assets/payment-process.png";
import fileRepeated from "../../assets/file-repeated.png";
import { User, Search, TriangleAlert, Trash2, Coins, Video, Star, DollarSign, CreditCard as CreditCardIcon, CircleHelp, Info, Clock, Download, Mail, ArrowRightLeft, CheckCircle, X, Hand } from "lucide-react";

const initCardI = {
  nameOwner: "",
  cardNumber: "",
  date: "",
  cvv: "",
};

const userInfoInit = {
  typeUser: "Estudiante" as typeUserCategory,
  user: "",
  email: "",
  password: "",
  id: "",
  name: "",
  lastName: "",
  favorites: [],
  subscriptions: [],
  card: [
    //     {
    //     nameOwner: '',
    //     cardNumber: '',
    //     date: '',
    //     cvv: '',
    // }
  ],
  picture: "",
};

const coursesInit = {
  infoCourse: [],
  total: 0,
  totalDiscount: 0,
};

const Cart = () => {
  const PARAMS = useParams();
  const { cartCtx, removeCourseCtx, clearCartCtx } =
    useContext(CartContextHook);

  const [cardSelected, setCardSelected] = useState<cardT>(initCardI);
  const [showModalCurrentCard, setShowModalCurrentCard] = useState(false);
  const [userInfo, setUserInfo] = useState<userT>(userInfoInit);

  const [showModalOxxo, setShowModalOxxo] = useState(false);

  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentCompletedOxxo, setPaymentCompletedOxxo] = useState(false);
  const [showModalPaymentProcess, setShowModalPaymentProcess] = useState(false);
  const [loaderPaymentProcess, setLoaderPaymentProcess] = useState(false);
  const [loader, setLoader] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [courses, setCourses] = useState<cartT>(coursesInit);

  const [showCoursesRepeatModal, setShowCoursesRepeatModal] = useState(false);

  const setNewUserCourse = (): boolean => {
    //traemos a todos los usuarios...
    let updated = false;
    const users = getStorageArr({ name: namesStorage.usersStorage }) as userT[];

    if (isNil(users) === true || isEmpty(users) === true) {
      simpleAlertTimer({
        title: "Ah ocurrido un error, no es posible proceder con la compra.",
        icon: "error",
      });
      return updated;
    }

    updated = true;
    // OBTENER LOS IDS DE LOS CURSOS EN EL CARRITO...
    const ids = courses.infoCourse.map((c) => c.idCourse);

    // ACTUALIZAR LA DATA DEL USUARIO...
    const newUserInfo = {
      ...userInfo,
      subscriptions: [...userInfo.subscriptions, ...ids],
    };

    setUserInfo(newUserInfo);

    // ACTUALIZAR EN EL STORAGE...
    const usersUpdated = users.map((u) => {
      if (u.id === userInfo.id) {
        return newUserInfo;
      } else {
        return u;
      }
    });

    saveStorage({
      name: namesStorage.usersStorage,
      value: JSON.stringify(usersUpdated),
    });

    return updated;
  };

  const makeCoursesData = (cart: cartT) => {
    setLoader(true);
    // setPaymentCompleted(false);

    setTimeout(() => {
      setLoader(false);
      setCourses(cart);
    }, 1500);
  };

  const handlePaymentMethod = (e: RadioChangeEvent) => {
    setPaymentMethod(e.target.value);
    if (e.target.value === "creditCard") {
      setShowModalCurrentCard(true);
    } else {
      e.target.value === "oxxo";
      setCardSelected(initCardI); // por si antes había elegido tarjeta y cambió de opinión...
    }
  };

  // const handlePaymentMethodCard = (e: RadioChangeEvent) => {
  // };

  const checkCurrentSubscriptions = (): boolean => {
    let coursesRepeat = false;
    let currentSubsRepeat: coursesT["id"][] = [];

    const updateCourses = courses.infoCourse.map((c) => {
      if (userInfo.subscriptions.some((sId) => sId === c.idCourse)) {
        currentSubsRepeat = [...currentSubsRepeat, c.idCourse];
        c.isRepeated = true;
      }
      return c;
    });

    if (isEmpty(currentSubsRepeat) === false) {
      coursesRepeat = true;
      setCourses({
        ...courses,
        infoCourse: updateCourses,
      });
      setShowCoursesRepeatModal(true);
    } else {
      coursesRepeat = false;
      setShowCoursesRepeatModal(false);
    }

    return coursesRepeat;
  };

  const handlePayment = () => {
    // VERIFICAR QUE ALGÚN CURSO AGREGADO NO EXISTA ACTUALMENTE EN LAS SUSCRIPCIONES DEL USUARIO...
    const haveRepeated = checkCurrentSubscriptions();
    if (haveRepeated === true) {
      // quiere decir que algún cursos ya fue comprado con anterioridad
      return;
    }

    // CONTINUAR TODOS LOS CURSOS A COMPRAR NO SE HAN AGREGADO ANTES...
    if (isNil(paymentMethod) === true || paymentMethod === "") {
      return simpleAlertTimer({
        title: "Selecciona un método de pago",
        icon: "info",
      });
    }

    // EN CASO DE QUE EL PAGO SEA CON TARJETA Y NO SE HAYA SELECCIONADO UNA TARJETA...
    if (paymentMethod === "creditCard" && cardSelected.cardNumber === "") {
      simpleAlertTimer({
        title: "Selecciona una tarjeta",
        icon: "warning",
      });
      setShowModalCurrentCard(true);
      return;
    }

    // CASO CORRECTO DE PAGO CON TARJETA Y TARJETA SELECCIONADA...

    if (paymentMethod === "creditCard" && cardSelected.cardNumber !== "") {
      // primero... se agrega a las suscripciones del usuario
      const canContinue = setNewUserCourse();

      if (canContinue === false) {
        return;
      }

      // segundo... ya que nos aseguramos que si hay usuarios en storage en este caso...
      setShowModalPaymentProcess(true);
      setTimeout(() => {
        setLoaderPaymentProcess(true);
      }, 2500);

      setTimeout(() => {
        // simulación de que se está realizando la transacción...
        setShowModalPaymentProcess(false);
        setLoaderPaymentProcess(false);
        setPaymentCompleted(true);
        resetPage();
      }, 3500);
    } // FIN IF CREDITCARD

    if (paymentMethod === "oxxo") {
      setShowModalOxxo(true);
    }
  };

  const handlePaymentOxxo = () => {
    setPaymentCompletedOxxo(false);
    closeModalOxxo();
    resetPage();
  };

  const closeModal = () => {
    setShowModalCurrentCard(false);
  };

  const closeModalOxxo = () => {
    setShowModalOxxo(false);
  };

  // const closeModalPaymentProcess = () => {
  //   setShowModalPaymentProcess(false);
  // };

  const getUserInfo = () => {
    setLoader(true);
    const currentUser: loginDataT = getStorageObj({
      name: namesStorage.loginDataStorage,
    }) as loginDataT;

    const allUsers: userT[] = getStorageArr({
      name: namesStorage.usersStorage,
    });

    if (isEmpty(currentUser) === true || isNil(currentUser) === true) {
      setLoader(false);
      return simpleAlertTimer({
        title: "Ah ocurrido un error.",
      });
    }

    // si todo bien
    const findUser = allUsers.find((u) => u.id === currentUser.idUser);

    if (isNil(findUser) === true || isEmpty(findUser) === true) {
      setLoader(false);
      return simpleAlertTimer({
        title: "Ah ocurrido un error.",
      });
    }

    // si si sale el usuario...
    setUserInfo(findUser);
    setLoader(false);
  };


  useEffect(() => {
    if (isNil(PARAMS?.idUser) === false) {
      makeCoursesData(cartCtx);
      getUserInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PARAMS]);

  const cardFormat = (cardNumber: string) => {
    const formatCard = "";
    if (cardNumber === "" || isNil(cardNumber) === true) {
      return formatCard;
    }

    
     const part1 = cardNumber.substring(0, cardNumber.length - 4).replace(/[0-9]/g, "*");
    
    const part2 = cardNumber.substring(cardNumber.length - 4);

    return part1 + '-' + part2;
    
  };

  const resetPage = () => {
    setCourses(coursesInit);
    setCardSelected(initCardI);
    clearCartCtx(); //AL ESTÁR TODO "PAGADO" SE LIMPIA TAMBIÉN EL CARRITO
  };

  useEffect(() => {
    makeCoursesData(cartCtx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartCtx]);

  return (
    <>
      <section className="w-sections">
        <Spin spinning={loader} size="large" style={{ minHeight: "300px" }}>
          <header>
            <p className="fw-bold fs-22 text-center">Tu carrito</p>
          </header>

          {/* NO CURSOS */}

          {(isEmpty(courses?.infoCourse) === true ||
            isNil(courses?.infoCourse) === true) && (
            <section>
              <div className="text-center">
                <div className="no-courses">
                  <img src={emptyImage} alt="" />
                </div>
                <p className="mt-3 mb-0 fs-22 fw-bold text-primary">
                  {paymentCompleted === true
                    ? "Tus cursos se han pagado correctamente, ve a tus suscripciones para iniciar con tu aprendizaje"
                    : "No tienes cursos agregados"}
                </p>

                <div className="d-flex justify-content-center">
                  {paymentCompleted === true && (
                    <Link to={`/profile/${userInfo.id}`} className="me-2">
                      <button className="btn btn-outline-success mt-3 d-inline-flex align-items-center justify-content-center">
                        <User size={18} className="me-2" />
                        Ir a mi perfil
                      </button>
                    </Link>
                  )}

                  <Link to={"/"}>
                    <button className="btn btn-outline-primary mt-3 d-inline-flex align-items-center justify-content-center">
                      <Search size={18} className="me-2" />
                      Buscar más cursos
                    </button>
                  </Link>
                </div>
              </div>
            </section>
          )}

{/* SI CURSOS */}
          <section>
            {isEmpty(courses?.infoCourse) === false &&
              isNil(courses?.infoCourse) === false && (
                <>
                  <Carousel itemsToShow={2} className="p-3">
                    {courses.infoCourse.map((c) => {
                      return (
                        <>
                          <div className="card-pay">
                            {c.isRepeated === true && (
                              <>
                                <p className="text-white bg-danger p-2 mb-0 rounded fw-bold align-self-center me-2 ">
                                  <TriangleAlert size={18} className="me-2" />
                                  Este cursos ya fue comprado
                                  <br />
                                  <button className="btn btn-danger d-inline-flex align-items-center justify-content-center" 
                                   onClick={() => {
                                    removeCourseCtx(c.idCourse);
                                  }}
                                  >
                                    <Trash2 size={16} className="me-2" /> Eliminar.

                                  </button>
                                </p>
                              </>
                            )}
                            <div className="cart-img">
                              <img src={c.imageCourse} alt="" />
                            </div>
                            <div className="ps-2 ">
                              <p className="mb-3 fw-bold">{c.titleCourse}</p>
                              <p className="mb-0 text-50">{c.teacherName}</p>

                              <div className="d-flex mt-3">
                                <p className="mb-0 me-2 fw-bold">
                                  ${c.discountPrice}
                                </p>
                                <p className="mb-0 text-decoration-line-through text-50">
                                  ${c.price}
                                </p>
                                <span>
                                  <Coins size={16} className="ms-1 text-warning" />
                                </span>
                              </div>
                              <div className="text-end">
                                <button
                                  className="btn btn-outline-danger btn-sm d-inline-flex align-items-center justify-content-center"
                                  onClick={() => {
                                    removeCourseCtx(c.idCourse);
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })}
                  </Carousel>

                  <div>
                    <p className="mb-2 fw-bold fs-22 text-center">
                      Resumen de tu pedido
                    </p>

                    {/* TUS CURSOS */}
                    <div className="info-container">
                      <p className="fw-bold fs-20 d-flex align-items-center">
                        <Video size={18} className="me-2" />
                        Tus cursos
                      </p>

                      <p className=" mb-1 fw-18">
                        Cantidad total:{" "}
                        <span className="fw-bold">
                          {courses?.infoCourse.length}
                        </span>{" "}
                      </p>

                      <ul>
                        {courses.infoCourse.map((c) => {
                          return (
                            <li className="text-primary fs-14 me-1">
                              {" "}
                              {c.titleCourse}{" "}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* TOTAL DE ARTÍCULOS */}
                    <div className="info-container mt-3">
                      <p className="fw-bold fs-20 d-flex align-items-center">
                        <Star size={18} className="me-2" />
                        Total de artículos:{" "}
                      </p>
                      <p className=" mb-1 fw-18 d-flex align-items-center">
                        Precio original:{" "}
                        <span className="fw-bold text-danger text-decoration-line-through d-flex align-items-center ms-2">
                          <DollarSign size={16} className="me-1" />
                          {courses?.totalDiscount.toFixed(2)}
                        </span>{" "}
                      </p>

                      <p className="mb-1 fw-18 bordered text-decoration-underline d-flex align-items-center">
                        Tu ahorro:{" "}
                        <span className="fw-bold text-warning d-flex align-items-center ms-2">
                          <DollarSign size={16} className="me-1" />
                          {(courses?.totalDiscount - courses?.total).toFixed(2)}
                        </span>{" "}
                      </p>
                      <p className=" mt-2 fw-18 d-flex align-items-center">
                        Total a pagar:{" "}
                        <span className="fw-bold text-primary d-flex align-items-center ms-2">
                          <DollarSign size={16} className="me-1" />
                          {courses?.total.toFixed(2)}
                        </span>{" "}
                      </p>
                    </div>

                    {/* MÉTODO DE PAGO */}
                    <div className="info-container mt-3">
                      <p className=" mb-1 fw-bold fs-20 d-flex align-items-center">
                        <CreditCardIcon size={18} className="me-2" />
                        Método de pago:
                      </p>

                      <p className="mb-1 text-danger fs-14">
                        {" "}
                        (por el momento solo se cuenta con pago con tarjeta y
                        Oxxo)
                      </p>

                      <Radio.Group
                        onChange={handlePaymentMethod}
                        value={paymentMethod}
                        className=""
                      >
                        <Radio className="d-block fs-14" value={"creditCard"}>
                          Tarjeta de crédito
                          <span className="ms-2">
                            (Paga de forma mensual o en un solo pago)
                          </span>
                        </Radio>
                        {/* <Radio className="d-block fs-14" value={"debitCard"}>
                          Tarjeta de débito
                          <span className="ms-2">(Todo en un solo pago)</span>
                        </Radio> */}
                        <Radio className="d-block fs-14" value={"oxxo"}>
                          Oxxo
                          <Tooltip
                            className="ms-2"
                            color="blue"
                            title={
                              <>
                                <p className="mb-0 fs-16 fw-bold">
                                  ¿Cómo utilizar OXXO?
                                </p>
                                <p className="mb-0 fs-14">
                                  Con el código de barras generado, tienes que{" "}
                                  <span className="fw-bold"> 72 horas </span>{" "}
                                  para pagar en cualquier tienda OXXO. Una vez
                                  realizado el pago, el estado de tu pedido se
                                  actualizará dentro de 1 o 2 días hábiles.
                                </p>
                              </>
                            }
                          >
                            <CircleHelp size={16} className="text-primary ms-2" />
                          </Tooltip>
                        </Radio>
                      </Radio.Group>

                      {isNil(cardSelected.cardNumber) === false &&
                        cardSelected.cardNumber !== "" && (
                          <div className="mt-3">
                            <p className="mb-0 badge bg-primary fs-14">
                              Tarjeta seleccionada:{" "}
                              <span className="fw-bold">
                                    {/* {cardSelected.cardNumber
                                  .substring(
                                    0,
                                    cardSelected.cardNumber.length - 4
                                  )
                                  .replace(/[0-9]/g, "*")}
                                {cardSelected.cardNumber.substring(
                                  cardSelected.cardNumber.length - 4
                                )} */}
                                {cardFormat(cardSelected.cardNumber)}
                              </span>
                            </p>
                          </div>
                        )}

                      <div className="text-end mb-2">
                        <button
                          className="btn btn-success d-inline-flex align-items-center justify-content-center"
                          onClick={() => {
                            handlePayment();
                          }}
                        >
                          {" "}
                          <Info size={18} className="me-2" /> Pagar ahora
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
          </section>
        </Spin>
      </section>

      {/* MODAL DE TARJETAS */}
      <Modal
        destroyOnClose={true}
        closable={false}
        open={showModalCurrentCard}
        footer={null}
        onCancel={() => closeModal()}
        centered={true}
        style={{
          position: 'relative'
        }}
      >
        <div style={{
          maxHeight: '500px',
          overflow: 'auto'
        }}>
          <header
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 100,
            background: '#ffffff',
            width: '100%',
            textAlign: 'center'
          }}
          className="p-3 pb-0"
          >
            <p className="text-dark fs-18 fw-bold">
              Selecciona o agrega un tarjeta para continuar
            </p>
          </header>

          <div className="mt-5">

            {isNil(userInfo) === false && isEmpty(userInfo) === false && (
              <CreditCard
                returnNewCards={(cardsUpdated) => {
                  // esto por si al abrir el método de pago con tarjeta, el usuario agrega una nueva...
                  setUserInfo({
                    ...userInfo,
                    card: cardsUpdated
                  });
                }}
                userInfo={userInfo}
                getCardsInfo={(card) => {
                  setCardSelected(card);

                  simpleAlertTimer({
                    title: "Tarjeta seleccionada",
                    icon: "success",
                  });
                  closeModal();
                }}
              />
            )}
          </div>
          
        </div>
      </Modal>

      {/* MODAL DEL OXXO */}
      <Modal
        destroyOnClose={true}
        closable={false}
        open={showModalOxxo}
        footer={null}
        onCancel={() => {}}
        centered={true}
      >
        <header>
          <p className="fs-18 fw-bold  mb-0 d-flex align-items-center">
            <Clock size={18} className="me-2" /> Pago con oxxo en menos de{" "}
            <span className="text-warning ms-1">72 horas</span>
          </p>

          <div>
            <p className=" mt-2 fw-18 text-primary d-flex align-items-center">
              Total a pagar:{" "}
              <span className="fw-bold d-flex align-items-center ms-2">
                <DollarSign size={16} className="me-1" />
                {courses?.total}
              </span>{" "}
            </p>
          </div>
        </header>

        <section>
          <p>
            Escanea este código de QR en cualquier{" "}
            <span className="fw-bold text-danger">tienda oxxo </span>
            para evitar que tu pedido se cancele
          </p>

          <div className="qr-image">
            <img src={qrImage} alt="" />
          </div>

          <div className="text-center d-flex flex-column">

            <div>
              <a  href={PDFDocument} download={true} className="">
              <button
                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center justify-content-center"
                onClick={() => {}}
                >
                <Download size={16} className="me-2" /> Guardar este código QR
              </button>
                </a>
            </div>

            <small className="text-success d-flex align-items-center justify-content-center mt-2">
              {" "}
              <Mail size={16} className="me-2" /> Le enviaremos un correo
              eléctronico al completar el pago.{" "}
            </small>
          </div>

          <div className="mt-3 text-center">
            <p className="mb-0 text-danger">
              ¿Deseas cambiar tu método de pago?
            </p>
            <button
              className="btn btn-warning btn-sm"
              onClick={() => {
                setShowModalOxxo(false);
                setPaymentMethod("");
              }}
            >
              {" "}
              <ArrowRightLeft size={16} className="me-2" /> Seleccionar
              otro método de pago
            </button>
          </div>
        </section>

        <footer>
          <div>
            <Tooltip
              trigger={"click"}
              open={paymentCompletedOxxo}
              color="#303035"
              title={
                <>
                  <p>
                    Si aceptas, una vez cerrado, se eliminará todo del carrito.
                    ¿Has guardado tu código QR?
                  </p>
                  <div className="text-end">
                    <button
                      className="btn btn-outline-primary me-2 d-inline-flex align-items-center justify-content-center"
                      onClick={() => {
                        handlePaymentOxxo();
                      }}
                    >
                      {" "}
                      <CheckCircle size={16} className="me-2" /> Sí{" "}
                    </button>
                    <button
                      className="btn btn-outline-warning d-inline-flex align-items-center justify-content-center"
                      onClick={() => {
                        setPaymentCompletedOxxo(false);
                      }}
                    >
                      {" "}
                      <X size={16} className="me-2" /> Aún no{" "}
                    </button>
                  </div>
                </>
              }
            >
              <div className="text-center">
                <button
                  className="btn btn-danger w-100 mt-3"
                  onClick={() => {
                    setPaymentCompletedOxxo(true);
                  }}
                >
                  {" "}
                  <X size={16} className="me-2" /> Cerrar
                </button>
              </div>
            </Tooltip>
          </div>
        </footer>
      </Modal>

      {/* MODAL DEL PROCESAMIENTO DE PAGO CON TARJETA */}
      <Modal
        destroyOnClose={true}
        closable={false}
        open={showModalPaymentProcess}
        footer={null}
        onCancel={() => {}} // closeModalPaymentProcess()}
        centered={true}
      >
        <Spin
          spinning={loaderPaymentProcess}
          tip={"Procesando..."}
          size="large"
        >
          <p className="fs-22 fw-bold  mb-0 d-flex align-items-center">
            <Coins size={22} className="me-2" /> Procesando tu pago con
            tarjeta
          </p>

          <div className="payment-process-img">
            <img src={payementProcessImg} alt="" />
          </div>

          <p className="bg-warning fs-18 mt-3 text-dark rounded p-2 d-flex align-items-center">
            <TriangleAlert size={20} className="me-2" />
            <span><span className="fw-bold"> No cierre esta ventana</span>, una vez el
            pago sea correcto, se cerrará de manera automática</span>
          </p>
        </Spin>
      </Modal>

      {/* MODAL PARA CUANDO SE DETECTA UN CURSO QUE YA FUE COMPRADO CON ANTERIORIDAD... */}
      <Modal
        destroyOnClose={true}
        closable={true}
        open={showCoursesRepeatModal}
        footer={null}
        onCancel={() => {
          setShowCoursesRepeatModal(false);
        }}
        centered={true}
      >
        <p className="fs-22 fw-bold text-danger mb-0 d-flex align-items-center">
          <Hand size={22} className="me-2" /> Antes de continuar...
        </p>

        <div className="file-repeated-img">
          <img src={fileRepeated} alt="" />
        </div>

        <p className="bg-warning fs-18 mt-3 text-dark rounded p-2 d-flex align-items-center">
          <TriangleAlert size={20} className="me-2" />
          <span>
          Hemos detectado alguno o algunos cursos en tu carrito a los cuales
          <span className="fw-bold"> ya te encuentras suscrito</span>. <br />
          Eliminalos de tu carrito para poder proceder con el pago.
          <br />
          Los cursos repetidos serán marcados en la parte superior.
          </span>
        </p>
        <div className="text-end">
          <button 
          className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center"
          onClick={() => {
            setShowCoursesRepeatModal(false);
          }}
          > <CheckCircle size={16} className="me-2" /> Entendido</button>
        </div>
      </Modal>

      
    </>
  );
};

export default Cart;
