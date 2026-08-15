import React, { useEffect, useState } from "react";

import { isEmpty, isNil } from "lodash";

import bcrypt from "bcryptjs";

import noCard from "../../../assets/credit-card.png";

import "../userProfile.scss";
import { Input, Spin, Tooltip } from "antd";
import { simpleAlertTimer } from "../../../helpers/alerts";
import { getStorageArr, saveStorage } from "../../../helpers/storagesFunc";
// import dayjs from "dayjs";
import { namesStorage } from "../../../initData/namesStorage";
import CreditCardModal from "../../../components/creditCard.tsx/CreditCardModal";
import { cardT, typeUserCategory, userT } from "../../../typesInterfaces/types";
import { Plus, CheckCircle, Pointer, Eye, EyeOff, Trash2 } from "lucide-react";

type propsT = {
  userInfo: userT;
  getCardsInfo?: (cardSelected: cardT) => void | null;
  returnNewCards?: (cardsUpdated: userT["card"] | []) => void;
};

const userInit = {
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

// type cardsP = cardT & {
//   id: string | number;
//   visible: boolean;
// };

const CreditCard: React.FC<propsT> = (props) => {
  const { userInfo } = props;
  const [loader, setLoader] = useState(true);
  const [cards, setCards] = useState<cardT[]>([]);
  const [userPass, setUserPass] = useState("");
  const [showModal, setShowModal] = useState(false);

  const makeCards = (cards: cardT[]) => {
    if (isEmpty(cards) === true || isNil(cards) === true) {
      setCards([]);
      setLoader(false);
      return;
    }

    const addIdCards = cards.map((c, id) => {
      c.visible = false;
      c.id = id;

      return c;
    });

    setTimeout(() => {
      setCards(addIdCards);
      setLoader(false);
    }, 1500);
  };

  const checkPass = (pass: string, userPass: string) => {
    const checkP = bcrypt.compareSync(pass, userPass);
    return checkP;
  };

  const showInfoCard = (idCard: string | number) => {
    const nameOwner = document.getElementById(
      `nameOwner-${idCard}`
    ) as HTMLInputElement;
    const date = document.getElementById(`date-${idCard}`) as HTMLInputElement;
    const cvv = document.getElementById(`cvv-${idCard}`) as HTMLInputElement;

    const cardNumber = document.getElementById(
      `cardNumber-${idCard}`
    ) as HTMLInputElement;
    const cardNumberLastDig = document.getElementById(
      `cardNumberLastDig-${idCard}`
    ) as HTMLElement;

    const types: { [key: string]: string } = {
      password: "text",
      text: "password",
    };

    const updateVisibleCards = cards.map((c) => {
      if (c.id === idCard) {
        c.visible = !c.visible;
      }

      return c;
    });

    setCards(updateVisibleCards);

    nameOwner.type = types[nameOwner.type];
    date.type = types[date.type];
    cvv.type = types[cvv.type];
    cardNumber.type = types[cardNumber.type];
    cardNumberLastDig.classList.toggle("d-none");
  };

  const deleteCard = (idCard: string | number) => {
    setLoader(true);
    const updateCards = cards.filter((c) => c.id !== idCard);

    //TODO: FALTA ACTUALIZAR EL STORAGE
    const users: userT[] = getStorageArr({ name: namesStorage.usersStorage });

    if (isNil(users) === true || isEmpty(users) === true) {
      return simpleAlertTimer({
        title: "Ha ocurrido un error intenta de nuevo o más tarde",
        icon: "error",
      });
    }

    let currentUser: userT = userInit;
    const updateUsers = users.map((u) => {
      if (userInfo.id === u.id) {
        u.card = updateCards;
        currentUser = u;
      }
      return u;
    });

    saveStorage({
      name: namesStorage.usersStorage,
      value: JSON.stringify(updateUsers),
    });

    setTimeout(() => {
      setLoader(false);
      makeCards(currentUser.card || []);
    }, 1000);
  };



  useEffect(() => {
      makeCards(userInfo.card || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  return (
    <>
      <Spin spinning={loader} size="large">
        <section className="">
          {(isEmpty(cards) === true || isNil(cards) === true) && (
            <>
              <div className="img-credit-card mx-auto mt-4">
                <img src={noCard} alt="" />
              </div>
              <div className="text-center">
                <p className="mb-0 fs-20 text-primary ">
                  No se han agregado tarjetas de pago
                </p>
                <div className="mt-3">
                  <button
                    className="btn btn-primary d-inline-flex align-items-center justify-content-center"
                    onClick={() => {
                      setShowModal(true);
                    }}
                  >
                    {" "}
                    <Plus size={16} className="me-2" /> Agregar
                  </button>
                </div>
              </div>
            </>
          )}

          {isEmpty(cards) === false && isNil(cards) === false && (
            <>
              {cards.map((c) => {
                return (
                  <>
                    <div className=" card-card-credit">
                      <div className="d-flex align-items-center justify-content-center mb-3">
                        <p className="mb-0 me-2">Propietario: </p>
                        <Input
                          type="password"
                          id={`nameOwner-${c.id}`}
                          value={c.nameOwner}
                          disabled
                        />
                      </div>

                      <div className="d-flex align-items-center justify-content-center mb-3">
                        <p className="mb-0 me-2">Tarjeta: </p>
                        <Input
                          type="password"
                          id={`cardNumber-${c.id}`}
                          value={c.cardNumber}
                          disabled
                          addonAfter={
                            <>
                              <span
                                className="text-primary fw-bold"
                                id={`cardNumberLastDig-${c.id}`}
                              >
                                -
                                {c.cardNumber.substring(
                                  c.cardNumber.length - 4
                                )}
                              </span>
                            </>
                          }
                        />
                      </div>

                      <div className="d-flex align-items-center justify-content-center">
                        <div className="d-flex align-items-center me-3">
                          <p className="mb-0 me-2">Fecha: </p>
                          <Input
                            type="password"
                            value={c.date}
                            disabled
                            id={`date-${c.id}`}
                          />
                        </div>

                        <div className="d-flex align-items-center">
                          <p className="mb-0 me-2">CVV: </p>
                          <Input
                            type="password"
                            value={c.cvv}
                            disabled
                            id={`cvv-${c.id}`}
                          />
                        </div>
                      </div>

                      <div className="text-end mt-2">
                        {/* PARA CUANDO SE HAGA EL PAGO DE LO QUE HAY EN EL CARRITO */}
                        {(isNil(props?.getCardsInfo) === false ||
                          isEmpty(props?.getCardsInfo) === false) && (
                          <>
                            <Tooltip
                              trigger={"click"}
                              destroyTooltipOnHide={true}
                              onOpenChange={() => {
                                // abra o cierre se resetea ese input..
                                setUserPass("");
                              }}
                              title={
                                <>
                                  <div>
                                    <p className="mb-2">
                                      Para seleccionar esta tarjeta, ingresa tu
                                      contraseña
                                    </p>
                                    <Input
                                      type="password"
                                      value={userPass}
                                      onChange={(e) => {
                                        setUserPass(e.target.value); // solo para guardar una ref...
                                      }}
                                    />
                                    <div className="mt-3 text-end">
                                      <button
                                        className="btn btn-outline-warning btn-sm d-inline-flex align-items-center justify-content-center"
                                        onClick={() => {
                                          const isCorrectPass = checkPass(
                                            userPass,
                                            userInfo.password
                                          );

                                          setUserPass("");
                                          if (isCorrectPass === false) {
                                            return simpleAlertTimer({
                                              title: "Contraseña incorrecta",
                                              icon: "error",
                                            });
                                          }

                                          // if (isNil(c.id) === false) {
                                          //   showInfoCard(c.id);
                                          // }
                                          if (
                                            isNil(props?.getCardsInfo) === false
                                          ) {
                                            props.getCardsInfo(c);
                                          }
                                        }}
                                      >
                                        {" "}
                                        <CheckCircle size={16} className="me-1" />{" "}
                                        Continuar
                                      </button>
                                    </div>
                                  </div>
                                </>
                              }
                              className="me-2"
                            >
                              <button
                                className="btn btn-outline-success d-inline-flex align-items-center justify-content-center"
                                onClick={() => {}}
                              >
                                <Pointer size={18} />
                              </button>
                            </Tooltip>
                          </>
                        )}

                        {/* BOTÓN PARA MOSTAR INFORMACIÓN DE LA TARJETA */}
                        {c.visible === false && (
                          <Tooltip
                            trigger={"click"}
                            destroyTooltipOnHide={true}
                            onOpenChange={() => {
                              // abra o cierre se resetea ese input..
                              setUserPass("");
                            }}
                            title={
                              <>
                                <div>
                                  <p className="mb-2">
                                    Para mostrar información, ingresa tu
                                    contraseña
                                  </p>
                                  <Input
                                    type="password"
                                    value={userPass}
                                    onChange={(e) => {
                                      setUserPass(e.target.value); // solo para guardar una ref...
                                    }}
                                  />
                                  <div className="mt-3 text-end">
                                    <button
                                      className="btn btn-outline-warning btn-sm d-inline-flex align-items-center justify-content-center"
                                      onClick={() => {
                                        const isCorrectPass = checkPass(
                                          userPass,
                                          userInfo.password
                                        );

                                        setUserPass("");
                                        if (isCorrectPass === false) {
                                          return simpleAlertTimer({
                                            title: "Contraseña incorrecta",
                                            icon: "error",
                                          });
                                        }

                                        if (isNil(c.id) === false) {
                                          showInfoCard(c.id);
                                        }
                                      }}
                                    >
                                      {" "}
                                      <CheckCircle size={16} className="me-1" />{" "}
                                      Continuar
                                    </button>
                                  </div>
                                </div>
                              </>
                            }
                            className="me-2"
                          >
                            <button
                              className="btn btn-danger d-inline-flex align-items-center justify-content-center"
                              onClick={() => {}}
                            >
                              <Eye size={18} />
                            </button>
                          </Tooltip>
                        )}

                        {/* BOTÓN PARA OCULAR LA INFORMACION DE UNA TARJETA */}

                        {c.visible === true && (
                          <Tooltip
                            title={"Ocultar información"}
                            className="me-2"
                          >
                            <button
                              className="btn btn-primary d-inline-flex align-items-center justify-content-center"
                              onClick={() => {
                                // showInfoCard(c.id);
                                if (isNil(c.id) === false) {
                                  showInfoCard(c.id);
                                }
                              }}
                            >
                              <EyeOff size={18} />
                            </button>
                          </Tooltip>
                        )}

                        {/*  BOTÓN PARA ELIMINAR UNA TARJETA */}
                        {isNil(props?.getCardsInfo) === true && (
                          <Tooltip
                            trigger={"click"}
                            destroyTooltipOnHide={true}
                            onOpenChange={() => {
                              // abra o cierre se resetea ese input..
                              setUserPass("");
                            }}
                            title={
                              <>
                                <div>
                                  <p className="mb-2">
                                    Para eliminar esta tarjeta, ingresa tu
                                    contraseña
                                  </p>
                                  <Input
                                    type="password"
                                    value={userPass}
                                    onChange={(e) => {
                                      setUserPass(e.target.value); // solo para guardar una ref...
                                    }}
                                  />
                                  <div className="mt-3 text-end">
                                    <button
                                      className="btn btn-outline-warning btn-sm"
                                      onClick={() => {
                                        const isCorrectPass = checkPass(
                                          userPass,
                                          userInfo.password
                                        );

                                        setUserPass("");
                                        if (isCorrectPass === false) {
                                          return simpleAlertTimer({
                                            title: "Contraseña incorrecta",
                                            icon: "error",
                                          });
                                        }

                                        if (isNil(c.id) === false) {
                                          deleteCard(c.id);
                                        }
                                        
                                      }}
                                    >
                                      {" "}
                                      <CheckCircle size={16} className="me-2" />{" "}
                                      Continuar
                                    </button>
                                  </div>
                                </div>
                              </>
                            }
                            className="me-2"
                          >
                            <button className="btn btn-dark" onClick={() => {}}>
                              <Trash2 size={16} />
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </>
                );
              })}
              <div className="mt-3 text-end">
                <button
                  className="btn btn-primary d-inline-flex align-items-center justify-content-center"
                  onClick={() => {
                    setShowModal(true);
                  }}
                >
                  {" "}
                  <Plus size={16} className="me-2" /> Agregar
                </button>
              </div>
            </>
          )}
        </section>
      </Spin>

      <CreditCardModal
        showModal={showModal}
        setShowModal={(actionToShow) => {
          setShowModal(actionToShow);
        }}
        callBackClose={({ updateUserInfo }) => {
          makeCards(updateUserInfo?.card || []);
          if (isNil(props?.returnNewCards) === false) {
            props.returnNewCards(updateUserInfo?.card || []);
          }
        }}
        userInfo={userInfo}
      />
    </>
  );
};

export default CreditCard;
