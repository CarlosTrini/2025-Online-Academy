import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Carousel } from "antd";

import "./mainPagePublic.scss";
import { Col, Row } from "react-bootstrap";
import { isEmpty, isNil } from "lodash";

import devIcon from "../../assets/dev-icon.png";
import kitchenIcon from "../../assets/ktichen-icon.png";
import jsIcon from "../../assets/js-icon.png";
import booksIcon from "../../assets/books-icon.png";
import painterIcon from "../../assets/painter-icon.png";
import musicIcon from "../../assets/music-icon.png";

import TabsContainer from "../../components/tabsContainer/TabsContainer";
import { courseCategoriesT } from "../../typesInterfaces/types";
import { getStorageArr } from "../../helpers/storagesFunc";
import { namesStorage } from "../../initData/namesStorage";
import ErrorPage from "../404/ErrorPage";

// NO QUIERO HACER UNA CLASE CADA QUE SE AGREGUE UNA NUEVA IMAGEN AL CAROUSEL
const imgAndText = [
  {
    // img: '../../assets/laptop.jpg',
    // img: "src/assets/laptop.jpg",
    img: "assets/laptop.jpg",
    title: "Sucribete a nuestros cursos",
    desc: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laudantium fugit, expedita, modi recusandae dignissimos eum, qui vitae officia exercitationem inventore repellat iusto nihil molestiae? Autem dolore adipisci ratione corrupti blanditiis.",
  },
  {
    // img: "src/assets/student.jpg",
    img: "assets/student.jpg",
    title: "Cientos de estudiantes",
    desc: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laudantium fugit, expedita, modi recusandae dignissimos eum, qui vitae officia exercitationem inventore repellat iusto nihil molestiae? Autem dolore adipisci ratione corrupti blanditiis.",
  },
  {
    // img: "src/assets/teacher.jpg",
    img: "assets/teacher.jpg",
    title: "¡Profesores de todo el mundo!",
    desc: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laudantium fugit, expedita, modi recusandae dignissimos eum, qui vitae officia exercitationem inventore repellat iusto nihil molestiae? Autem dolore adipisci ratione corrupti blanditiis.",
  },
];

type simpleCarouselT = {
  style: React.CSSProperties;
  title: string;
  desc: string;
};

type popularCategories = {
  name: courseCategoriesT;
  img: string;
};

const MainPagePublic = () => {
  const PARAMS = useParams();

  const [errorId, setErrorId] = useState(false);
  const [carousel, setCarousel] = useState<simpleCarouselT[]>([]);
  const [popularCategories, setPopularCategories] = useState<
    popularCategories[]
  >([]);

  const makeCarousel = () => {
    const carouselE: simpleCarouselT[] = imgAndText.map((v) => {
      return {
        style: {
          height: "70vh",
          // maxHeight: "1000px",
          background: `url(${v.img}) center/cover no-repeat`,
        },
        desc: v.desc,
        title: v.title,
      };
    });

    setCarousel(carouselE);
  };

  const cardsPopularCategories = () => {
    const popCat = getStorageArr({
      name: namesStorage.popularCategoriesStorage,
    });
    setPopularCategories(popCat);
  };

  useEffect(() => {
    makeCarousel();
    cardsPopularCategories();
  }, []);

  useEffect(() => {
    if (isNil(PARAMS.id) === false) {
      const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
      if (regex.test(PARAMS.id) === false) {
        setErrorId(true);
      } else {
        setErrorId(false);
      }
      return;
    }

    setErrorId(false);
  }, [PARAMS]);

  if (errorId === true) {
    return <ErrorPage />;
  }

  return (
    <>
      <section className="carousel-container">
        <Carousel
          slidesToShow={1}
          autoplay
          arrows
          infinite={true}
          className="carousel-container-inside"
        >
          {isEmpty(carousel) === false &&
            carousel.map((c: simpleCarouselT) => (
              <>
                <Row className="d-flex align-items-center" style={c.style}>
                  <Col md={4} className="p-5">
                    <div className="carousel-text-container p-3">
                      <h3 className="carousel-text-title">{c.title}</h3>
                      <p className="mb-0 carousel-text-desc mt-3">{c.desc}</p>
                    </div>
                  </Col>
                </Row>
              </>
            ))}
        </Carousel>
      </section>

      <section className="block-styles ">
        <div className="text-center">
          <h3 className="fw-bold fs-36">Online Academy</h3>
          <p className="fs-18 w-50 mx-auto mt-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo,
            officia neque odio earum delectus, sint placeat dolorem vitae eum
            hic laudantium debitis maxime
          </p>
        </div>

        <Row className="block-images mt-4">
          <Col md={2} className="text-center">
            <img src={devIcon} alt="developer icon" width={60} height={60} />
          </Col>
          <Col md={2} className="text-center">
            <img src={kitchenIcon} alt="kitchen icon" width={60} height={60} />
          </Col>
          <Col md={2} className="text-center">
            <img src={jsIcon} alt="javascript icon" width={60} height={60} />
          </Col>
          <Col md={2} className="text-center">
            <img src={painterIcon} alt="painter icon" width={60} height={60} />
          </Col>
          <Col md={2} className="text-center">
            <img src={booksIcon} alt="books icon" width={60} height={60} />
          </Col>
          <Col md={2} className="text-center">
            <img src={musicIcon} alt="music icon" width={60} height={60} />
          </Col>
        </Row>
      </section>

      <section className="mt-4 pb-4 container block-courses ">
        <p className="fs-24 fw-bold">Gran variedad de cursos</p>

        <p className="fs-18">
          Elige entre todos nuestros cursos de vídeo en línea. Nuevo contenido
          cada mes
        </p>

        <TabsContainer />
      </section>

      <section className="section-popular mt-2 pt-4">
        <div className="">
          <h3 className="fw-bold">Categorías más populares</h3>
        </div>

        <div className="popular-courses mt-4">
          {popularCategories.map((c) => {
            return (
              <>
                <div className="popular-courses-info">
                  <p className="mb-1">{c.name}</p>
                  <div>
                    <img src={c.img} alt="" width={100} />
                  </div>

                  <button className="btn btn-outline-light btn-sm mt-2  popular-btn-link">
                    <Link to={`course/by-category/${c.name}`}> Ver más </Link>
                  </button>
                </div>
              </>
            );
          })}
        </div>
      </section>

      <section className=" section-others container mt-3 pb-5">
        <Row className="d-flex align-items-center">
          <Col md={6}>
            <p className="fs-30 fw-bold text-primary">Online Academy</p>
            <p className="fs-26 fw-bold">
              Conviertete en estudiante y desarrolla tus habilidades
            </p>
            <ul className="fs-22 pb-0">
              <li>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Repudiandae, optio!
              </li>
              <li>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Repudiandae, optio!
              </li>
              <li>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Repudiandae, optio!
              </li>
            </ul>
          </Col>
          <Col md={6}>
            <img
              src={"assets/student-bann.jpg"}
              alt=""
              className="img-fluid"
            />
          </Col>
        </Row>

        <Row className="d-flex align-items-center">
          <Col md={6}>
            <img
              src={"assets/teacher-bann.jpg"}
              alt=""
              className="img-fluid"
            />
          </Col>
          <Col md={6} className="ps-5">
            <p className="fs-26 fw-bold">Conviértete en instructor</p>
            <p>
              Instructores de diferentes partes del mundo enseñan a millones de
              estudiantes. Solo dinos que quieres ser instructor.
            </p>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default MainPagePublic;
