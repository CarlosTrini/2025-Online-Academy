import { useContext, useEffect, useState } from "react";

import "./header.scss";
import { Col, Row, Select, Drawer, Badge, Dropdown, Carousel } from "antd";
import imgLogo from "../../assets/logo.jpg";
import { isEmpty, isNil } from "lodash";
import { getStorageArr } from "../../helpers/storagesFunc";
import { namesStorage } from "../../initData/namesStorage";

// INTERFACES AND TYPES
import { courseCategoriesT } from "../../typesInterfaces/types";
import { Link, useNavigate } from "react-router-dom";
import { CartContextHook } from "../../context/CartContextProvider";

import emptyCart from "../../assets/empty-box.png";
import { CategoryContextHook } from "../../context/categoryContextProvider";
import { AuthContextHook } from "../../context/AuthContextProvider";
import { simpleAlertTimer } from "../../helpers/alerts";
import GlobalLoader from "../loader/GlobalLoader";
import { ShoppingBag, DoorOpen, UserRoundPlus, UserCircle, DoorClosed, Coins, Trash2, CreditCard } from "lucide-react";

type categoriesCatalog = {
  value: courseCategoriesT;
  label: courseCategoriesT;
};

const Header = () => {
  const { cartCtx, removeCourseCtx } = useContext(CartContextHook);
  const { currentCategoryCtx, updateCurrentCategory } =
    useContext(CategoryContextHook);
  const { authInfo, isAuth, closeAuth } = useContext(AuthContextHook);

  const [showGlobalLoader, setShowGlobalLoader] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [categories, setCategories] = useState<categoriesCatalog[]>([]);

  const NAVIGATE = useNavigate();

  const makeCategoriesCatalog = () => {
    // las categorias en storage son un array, hay que transformala a [{value: category, label: category}] como
    // lo pide el componente... para eso el typ categoriesCatalog

    const data = getStorageArr({
      name: namesStorage.categoriesStorage,
    });

    if (isNil(data) === false && isEmpty(data) === false) {
      const catalog: categoriesCatalog[] = data.map((c: courseCategoriesT) => {
        const objCategory: categoriesCatalog = {
          label: c,
          value: c,
        };

        return objCategory;
      });
      setCategories(catalog);
    }
  };

  const redirectMainPage = () => {
    NAVIGATE("/");
  };

  const payCart = () => {

    if (isAuth === false) {
      return simpleAlertTimer({
        title: 'Es necesario inciar sesión',
        icon: 'info',
        timer: 2000
      });
    }

    setShowCart(false);
    NAVIGATE(`/cart/${authInfo.idUser}`);

  }

  const showGlobalLoaderFn = (value: boolean) => {
    setShowGlobalLoader(value);
    setTimeout(() => {
      setShowGlobalLoader(false);
    }, 1400);
  }

  useEffect(() => {
    makeCategoriesCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {
        showGlobalLoader === true && (
          <GlobalLoader />
        )
      }
      <header className="header-style">
        <Row className="justify-content-between align-items-center flex-column flex-md-row gap-3 gap-md-0 pb-3 pb-md-0">
          <Col xs={12} md={4} lg={3} className="d-flex align-items-center justify-content-between justify-content-md-start w-100 w-md-auto" >
            <div
              className="d-flex align-items-center flex-shrink-0"
              style={{ cursor: "pointer" }}
              onClick={() => redirectMainPage()}
            >
              <img
                src={imgLogo}
                alt=""
                width={30}
                height={30}
                className="rounded-circle"
              />
              <p className="mb-0 fw-bold ms-2 text-primary d-none d-sm-block">Online Academy</p>
            </div>
            <Select
              style={{ width: "100%", maxWidth: "200px" }}
              className="ms-3 flex-grow-1 flex-md-grow-0"
              placeholder={"Categorías"}
              options={categories}
              // value={categorySelected}
              value={currentCategoryCtx}
              onChange={(c) => {
                updateCurrentCategory(c);
                if (c !== "") {
                  NAVIGATE(`/course/by-category/${c}`);
                }
              }}
            ></Select>
          </Col>

          <Col
            xs={12}
            md={8}
            lg={9}
            className="d-flex justify-content-center justify-content-md-end align-items-center flex-wrap gap-3"
          >
            {/* <div style={{ width: "40%" }}>
              <Input
                type="text"
                className="fs-14"
                autoComplete={"off"}
                placeholder="Instructor, curso, categoría o tag"
                id="search"
                value={""}
                size="large"
                // addonAfter={<i className="fas fa-search text-primary" />}
                onChange={() => {}}
              />
            </div> */}

            <Badge count={cartCtx.infoCourse.length}>
              <div style={{ fontSize: "24px" }} className="">
                <p
                  className="mb-0 "
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowCart(!showCart);
                  }}
                >
                  <ShoppingBag size={24} className="text-primary" />
                </p>
              </div>
            </Badge>

            {isAuth === false && (
              <div className="d-flex gap-2">
                <button className="btn btn-outline-dark btn-sm d-inline-flex align-items-center justify-content-center px-3">
                  <DoorOpen size={16} className="me-2" />
                  <Link to={"/login"} className="text-reset text-decoration-none">Login</Link>
                </button>

                <button className="btn btn-primary btn-sm d-inline-flex align-items-center justify-content-center px-3">
                  <UserRoundPlus size={16} className="me-2" />
                  <Link to={"/register"} className="text-white text-decoration-none">Registro</Link>
                </button>
              </div>
            )}

            {isAuth === true && (
              <div className="d-flex align-items-center gap-2">
                <p className="mb-0 fs-16 fw-bold d-none d-sm-block text-dark">{authInfo.name}</p>
                <div>

                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "1",
                          label: (
                            <>
                              <div className="text-center">
                                <Link to={`/profile/${authInfo.idUser}`}>
                                  {/* <button className=" "> */}

                                  <p className="mb-0 fs-16 text-primary d-flex align-items-center">
                                    <UserCircle size={18} className="me-2" />

                                    Mi perfil
                                  </p>
                                  {/* </button> */}
                                </Link>
                              </div>
                            </>
                          ),
                        },
                        {
                          key: "2",
                          label: (
                            <>
                              <div>
                                <button className="btn text-danger d-inline-flex align-items-center justify-content-center"
                                  onClick={() => {
                                    showGlobalLoaderFn(true);
                                    setTimeout(() => {
                                      closeAuth();
                                    }, 1000);
                                  }}
                                >
                                  <DoorClosed size={18} className="me-2" />{" "}
                                  Cerrar sesión
                                </button>
                              </div>
                            </>
                          ),
                        },
                      ],
                    }}
                  >
                    <div className="profile-header">
                      <img src={authInfo.userPicture} alt="" />
                    </div>
                  </Dropdown>
                </div>
              </div>
            )}
          </Col>
        </Row >

        {/* CART DRAWER */}
        < Drawer
          width={450}
          // style={{position: 'relative'}}
          title={
            <>
              <p className="mb-0 text-primary ">Cursos listos para tí</p>
            </>
          }
          onClose={() => {
            setShowCart(!showCart);
          }}
          open={showCart}
        >
          <section
            className="cart-drawer-section"
          >
            {/* placeholder si no hay data  */}
            {isNil(cartCtx.infoCourse) === true ||
              (isEmpty(cartCtx.infoCourse) === true && (
                <div className="no-content-container">
                  <div className="no-content-image">
                    <img src={emptyCart} alt="" />
                  </div>
                  <p className="text-primary fs-22 fw-bold text-center">
                    Aún no se han agregado cursos a tu carrito
                  </p>
                </div>
              ))}

            {/* data */}
            {isEmpty(cartCtx.infoCourse) === false && (
              <>
                <Carousel dotPosition="left"
                  dots={false}
                  slidesToShow={2}
                  autoplay
                  arrows
                  infinite={false}
                  className="carousel-cart"
                >
                  {cartCtx.infoCourse.map((c, idx) => {
                    return (
                      <div className="mb-3 card-cart ">
                        <div className="card-cart-content">
                          <div className="badge bg-primary d-flex align-items-center me-1 fw-bold fs-12">
                            <p className="mb-0" >{idx + 1}</p>
                          </div>
                          <div className="card-cart-img">
                            <img src={c.imageCourse} alt={c.titleCourse} />
                          </div>
                          <div className="ps-2 ">
                            <p className="mb-3 fw-bold">{c.titleCourse}</p>
                            <p className="mb-0 text-50">{c.teacherName}</p>

                            <div className="d-flex">
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
                          </div>
                        </div>
                        <div className="text-end card-delete">
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
                    );
                  })}

                </Carousel>

                <div className="cart-pay-section">
                  <p className="fw-bold mb-0 fs-20">Total</p>
                  <div className="bg-dark d-flex text-white justify-content-between rounded p-3 align-items-center">
                    <p className="mb-0 fw-bold fs-20 d-flex align-items-center">
                      ${cartCtx.total.toFixed(2)}
                      <Coins size={20} className="text-warning ms-2" />
                    </p>
                    <p className="bg-danger p-2 mb-0 text-decoration-line-through  fs-16">
                      ${cartCtx.totalDiscount.toFixed(2)}
                    </p>
                  </div>
                  <div className="">
                    <button className="w-100 btn btn-primary mt-1 d-inline-flex align-items-center justify-content-center"
                      onClick={() => {
                        payCart();
                      }}
                    >
                      {" "}
                      <CreditCard size={18} className="me-2" /> Pagar
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </Drawer >
      </header >
    </>
  );
};

export default Header;
