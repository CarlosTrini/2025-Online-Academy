import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";

import Carousel from "next-elastic-carousel";

import "./infoByCourseName.scss";
import { contentT, coursesT, scoreT, teacherT } from "../../typesInterfaces/types";
import { isEmpty, isNil } from "lodash";
import { getStorageArr, saveStorage } from "../../helpers/storagesFunc";
import { namesStorage } from "../../initData/namesStorage";

import notFoundCourse from "../../assets/not-found-course.svg";
import commentsImg from "../../assets/comments-section.png";
import { Tag, Collapse as CollapseAntd, Modal, Input, Radio, Spin, RadioChangeEvent } from "antd";
import { Collapse } from "reactstrap";
import { Col, Row } from "react-bootstrap";
import { BookOpen, Home, ChevronRight, Info, Clock, Tag as TagIcon, Coins, ShoppingCart, ChevronUp, ChevronDown, Check, MessageCircle, UserCircle, Star, Users, Book, GraduationCap, Feather, X, Send } from "lucide-react";

import noPictureImg from "../../assets/teachers.svg";
import { CartContextHook } from "../../context/CartContextProvider";
import { AuthContextHook } from "../../context/AuthContextProvider";
import { simpleAlertTimer } from "../../helpers/alerts";

type skillsLongT = {
  partOne: string[];
  partTwo: string[];
};

const initDataCourseInfo: coursesT = {
  content: [],
  longSkills: [],
  id: "",
  title: "",
  longDescription: {
    title: "",
    description: "",
  },
  shortDescription: "",
  skills: ["", "", ""],
  score: 0,
  idTeacher: "",
  lastUpdated: "",
  students: 0,
  image: "",
  discountPercentaje: 0,
  discountPrice: "",
  price: 0,
  tags: [],
  level: "Básico",
  courseDuration: "",
  commentsCourse: [],
  category: "Desarrollo web",
  subscribers: [],
};

const initTeacherInfo: teacherT = {
  picture: "",
  typeUser: "Docente",
  id: "",
  name: "",
  lastName: "",
  aboutMe: {
    greeting: "",
    text: "",
  },
};

type contentCourse = {
  // asi lo pide antD
  key: string;
  label: JSX.Element;
  children: JSX.Element;
};

const badWords = [
  { value: "Puta" },
  { value: "Coño" },
  { value: "Hijo" },
  { value: "Inútil" },
  { value: "Estúpido" },
  { value: "Mierda" },
  { value: "Culo" },
  { value: "Gilipollez" },
  { value: "Puto" },
  { value: "Idiota" },
  { value: "Marica" },
  { value: "Gusanillo" },
  { value: "Cabrón" },
  { value: "Cobarde" },
  { value: "Mentiroso" },
  { value: "Inmundo" },
  { value: "Patán" },
  { value: "Payaso" },
  { value: "Cagado" },
  { value: "Grito" },
  { value: "Chinga" },
  { value: "Tonto" },
  { value: "Puto" },
  { value: "Choro" },
  { value: "Idiota" },
  { value: "Mamoncillo" },
  { value: "Maldito" },
  { value: "Chorizo" },
  { value: "verga" },
  { value: "Tignonazo" },
  { value: "Chavalo" },
  { value: "Guey" },
  { value: "Marrano" },
  { value: "Vato loco" },
  { value: "Pendejo" },
  { value: "Cagüezón" },
  { value: "Boludo" },
  { value: "Pelotudo" },
  { value: "Hijueputa" },
  { value: "Chisgarabato" },
  { value: "Choroqueo" },
  { value: "Fugasoso" },
  { value: "Gaditico" },
  { value: "Güeyazo" },
  { value: "nmms" },
  { value: "pndjo" },
];

const InfoByCourseName = () => {
  const PARAMS = useParams();
  const { updateCartCtx } = useContext(CartContextHook);
  const { authInfo, isAuth } = useContext(AuthContextHook);

  const [courseInfo, setCourseInfo] = useState(initDataCourseInfo);
  
  const [score, setScore] = useState({ qty: 0, stars: [false, false, false, false, false] });

  const [average, setAverage] = useState({
    mark: 0,
    comments: 0,
    studentes: 0,
    courses: 0,
  });

  const [courseContent, setCourseContent] = useState<contentCourse[]>([]);

  const [addCommentInput, setAddCommentInput] = useState({
    comment: "",
    score: 0,
  });
  const [showModalComment, setShowModalComment] = useState(false);
  const [loaderModalComment, setLoaderModalComment] = useState(false);

  const [teacherInfo, setTeacherInfo] = useState(initTeacherInfo);

  const [showSkills, setShowSkills] = useState(false);
  const [skills, setSkills] = useState<skillsLongT>({
    partOne: [],
    partTwo: [],
  });
  const [isNotFound, setIsNotFound] = useState(false);

  const makeScore = (score: number, isForComentSection: boolean = false) => {
    const fillS = score;
    const emptyS = 5 - fillS;

    const starsArr = [
      ...Array(fillS).fill(true),
      ...Array(emptyS).fill(false),
    ];

    if (isForComentSection === true) {
      return starsArr;
    }

    setScore({
      qty: score,
      stars: starsArr,
    });
  };

  const addComment = () => {
    if (addCommentInput.comment === '' || addCommentInput.score === 0) {
      return simpleAlertTimer({
        title: 'Agrega un comentario y una calificación',
        icon: 'info'
      });
    }

    const comment = addCommentInput.comment.toLocaleLowerCase();

    const hasBadWord = badWords.some(bad => {
      return comment.includes(bad.value.toLocaleLowerCase())
    });

    if (hasBadWord) {
      return simpleAlertTimer({
        title: 'Tú comentario no puede ser publicado. Evita usar palabras ofensivas',
        icon: 'error',
        timer: 3000
      });
    }

    // TRAERMOS TODOS LOS CURSOS...
    const courses = getStorageArr({name: namesStorage.coursesStorage}) as coursesT[];

    const currentCourse = courses.find(c => c.id === courseInfo.id);

    if (isNil(currentCourse) === true || isEmpty(currentCourse) === true) {
      return simpleAlertTimer({
        title: 'Ops, ah ocurrido un error. Intenta más tarde',
        icon: 'warning'
      });
    }

    setLoaderModalComment(true);
    currentCourse.commentsCourse?.push({
      userName: authInfo.name,
      comment: addCommentInput.comment,
      score: addCommentInput.score as scoreT
    });

    const coursesUpdated = courses.map(c => {
      if (c.id === courseInfo.id) {
        c = currentCourse;
      }
      return c
    });

    saveStorage({
      name: namesStorage.coursesStorage,
      value: JSON.stringify(coursesUpdated)
    });

    setTimeout(() => {
      setLoaderModalComment(false);
      setShowModalComment(false);
      setAddCommentInput({
        comment: '',
        score: 0
      });
      searchCourse(PARAMS.courseName || "");
    }, 1500);

  };

  const makeTeacherInfo = (idTeacher: teacherT["id"]) => {
    const teachers = getStorageArr({ name: namesStorage.teachersStorage });

    if (isEmpty(teachers) === true || idTeacher === "") {
      return;
    }

    const teacherFilter = teachers.find((t: teacherT) => t.id === idTeacher);
    if (isNil(teacherFilter) === true || isEmpty(teacherFilter) === true) {
      return;
    }

    setTeacherInfo(teacherFilter);
  };

  const makeSkills = (skills: coursesT["longSkills"]) => {
    let partOne: skillsLongT["partOne"] = [];
    let partTwo: skillsLongT["partTwo"] = [];

    if (skills.length === 6) {
      partOne = skills;
    } else if (skills.length > 6) {
      partOne = skills.slice(0, 6);
      partTwo = skills.slice(6);
    }

    setSkills({
      partOne,
      partTwo,
    });
  };

  const makeAverages = (allTeacherCourses: coursesT[]) => {
    let totalStudents = 0;
    let totalComments = 0;
    let totalMarks = 0;

    const totalCourses = allTeacherCourses.length;
    console.log(allTeacherCourses);
    allTeacherCourses.map((t) => (totalStudents += t.students));
    allTeacherCourses.map((t) => {
      if (isNil(t.commentsCourse) === false ) {
        totalComments += t.commentsCourse.length;
      } else {
        totalComments = 0;
      }
    });
    allTeacherCourses.map((t) => (totalMarks += t.score));

    setAverage({
      courses: totalCourses,
      studentes: totalStudents,
      comments: totalComments,
      mark: Math.ceil(totalMarks / totalCourses),
    });
  };

  const makeContent = (content: contentT[]) => {
    const contentCollapse = content.map((c, idx) => {
      return {
        key: idx.toString(),
        label: <span className="fw-bold">{c.contentTitle}</span>,
        children: (
          <>
            <div>
              {c.chapter.map((chap) => {
                return (
                  <>
                    <div className="d-flex justify-content-between ">
                      <p className="d-flex align-items-center">
                        {" "}
                        <BookOpen size={16} className="me-2 text-primary" />{" "}
                        {chap.title}{" "}
                      </p>
                      <p className="text-secondary fw-bold">
                        {" "}
                        Duración: {chap.duration} mins.
                      </p>
                    </div>
                  </>
                );
              })}
            </div>
          </>
        ),
      };
    });
    setCourseContent(contentCollapse);
  };

  const searchCourse = (courseName: string) => {
    const courses = getStorageArr({ name: namesStorage.coursesStorage });

    if (isEmpty(courses) === true || courseName === "") {
      return setIsNotFound(true);
    }

    const courseFilter: coursesT = courses.find(
      (c: coursesT) => c.title === courseName
    );
    if (isNil(courseFilter) === true || isEmpty(courseFilter) === true) {
      return setIsNotFound(true);
    }

    // para sacar los promedios
    const allTeacherCourses: coursesT[] = courses.filter(
      (c: coursesT) => c.idTeacher === courseFilter.idTeacher
    );

    makeContent(courseFilter.content || []);
    makeSkills(courseFilter.longSkills);
    makeAverages(allTeacherCourses);
    makeScore(courseFilter.score, false);
    makeTeacherInfo(courseFilter.idTeacher);
    setCourseInfo(courseFilter);
  };

  useEffect(() => {
    if (isNil(PARAMS) === false && isEmpty(PARAMS) === false) {
      searchCourse(PARAMS.courseName || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PARAMS]);

  return (
    <>
      {isNotFound === true && (
        <>
          <div className="text-center py-5 my-5">
            <img src={notFoundCourse} alt="" width={400} height={400} />
          </div>
          <p className="text-center fw-bold fs-22 text-primary">
            Oops! Este curso no ha sido encontrado
          </p>
          <div className="text-center">
            <Link to={"/"}>
              <button className="btn btn-outline-dark d-inline-flex align-items-center justify-content-center">
                <Home size={18} className="me-2" />
                Página principal
              </button>
            </Link>
          </div>
        </>
      )}
      {
        isNotFound === false && (
          <>
            <header className="header-container ">
              <div className="header-info">
                <div>
                  <p className="d-flex align-items-center">
                    Categoría
                    <ChevronRight size={18} className="text-warning mx-2" />
                    <Link to={`/course/by-category/${courseInfo.category}`}>
                      <span className="fw-bold text-primary">
                        {courseInfo.category}
                      </span>
                    </Link>
                  </p>
                </div>
                <h3 className="fw-bold fs-36">{courseInfo.title}</h3>
                <p>{courseInfo.shortDescription}</p>

                <div className="d-flex align-items-center">
                  <p className="me-4 d-flex align-items-center mb-0">
                    {" "}
                    {score.qty}{" "}
                    <span className="ms-2 d-flex">
                      {score.stars.map((isFilled, i) => (
                        <Star key={i} size={16} className={isFilled ? "text-warning" : "text-white-50"} fill={isFilled ? "#ffc107" : "none"} />
                      ))}
                    </span>
                  </p>

                  <p className="mb-0">{courseInfo.students} estudiantes</p>
                </div>

                <p>
                  Creado por:{" "}
                  <span className="fw-bold">
                    {teacherInfo.name} {teacherInfo.lastName}
                  </span>
                </p>

                <p className="d-flex align-items-center">
                  <Info size={16} className="me-2 text-white" />
                  Última Actualización:{" "}
                  <span className="fw-bold ms-1"> {courseInfo.lastUpdated} </span>
                </p>

                <p className="d-flex align-items-center">
                  <Clock size={16} className="me-2 text-white" />
                  Duración de:{" "}
                  <span className="fw-bold ms-1">
                    {" "}
                    {courseInfo.courseDuration} hrs{" "}
                  </span>
                </p>

                <div className=" tags-container">
                  {courseInfo.tags.map((tag, i) => {
                    return (
                      <Tag color="#0D6EFD" key={i}>
                        {/* <p className="badge text-bg-primary"> */}
                        <div className="d-flex align-items-center">
                          <TagIcon size={14} className="me-1" />
                          {tag}
                        </div>
                        {/* </p> */}
                      </Tag>
                    );
                  })}
                </div>
              </div>

              <div className="card-header-info">
                <div className="card-header-image">
                  <img src={courseInfo.image} alt={courseInfo.title} />
                </div>
                <div>
                  <p className="fs-24 fw-bold mb-0 price d-flex align-items-center">
                    {courseInfo.discountPrice === "0" ||
                    courseInfo.discountPrice === "" ? (
                      <>${courseInfo.price} MX </>
                    ) : (
                      <>
                        ${courseInfo.discountPrice} MX{" "}
                        <span className="fs-18 fw-normal text-50 ms-2">
                          ${courseInfo.price}
                        </span>{" "}
                      </>
                    )}
                    <Coins size={20} className="text-warning ms-2" />{" "}
                  </p>
                  <p className="fs-16 text-50">
                    aprovecha la temporada de descuentos
                  </p>
                  <div className="text-end">
                    <button
                      className="btn btn-primary d-inline-flex align-items-center justify-content-center"
                      onClick={() => {
                        updateCartCtx({
                          idCourse: courseInfo.id,
                          imageCourse: courseInfo.image,
                          idTeacher: courseInfo.idTeacher,
                          titleCourse: courseInfo.title,
                          price: courseInfo.price,
                          discountPrice: courseInfo.discountPrice,
                          teacherName:
                            teacherInfo.name + " " + teacherInfo.lastName,
                          isRepeated: false,
                        });
                      }}
                    >
                      <ShoppingCart size={18} className="me-2" />
                      Añadir al carrito
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-50 fs-12">
                    Garantía de reembolso de 20 días
                  </span>
                </div>
              </div>
            </header>

            {/* SKILL */}
            {isEmpty(skills.partOne) === false && (
              <section>
                <div className="collapse-container w-sections">
                  <Collapse isOpen={true} className="collapse-style p-3">
                    {/* collapse button */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <p className="fs-22 fw-bold mb-0">
                        Incrementa tus habilidades!
                      </p>
                      {/* este boton solo aparecerá si hay más de 6 skills */}
                      {isEmpty(skills.partTwo) === false && (
                        <button
                          className="btn btn-link text-primary d-inline-flex align-items-center justify-content-center"
                          onClick={() => {
                            setShowSkills(!showSkills);
                          }}
                        >
                          {showSkills === true ? (
                            <>
                              {" "}
                              Ver menos{" "}
                              <ChevronUp size={16} className="ms-2 text-primary" />
                            </>
                          ) : (
                            <>
                              {" "}
                              Ver más{" "}
                              <ChevronDown size={16} className="ms-2 text-primary" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {/* skills */}
                    <Row className="">
                      {skills.partOne.map((s) => {
                        return (
                          <Col
                            className="p-2 d-flex align-items-center "
                            md={6}
                            key={i}
                          >
                            <Check size={16} className="text-50 me-2" />
                            <p className="mb-0"> {s} </p>
                          </Col>
                        );
                      })}
                    </Row>
                    {isEmpty(skills.partTwo) === false && (
                      <Collapse isOpen={showSkills}>
                        <Row className="">
                          {skills.partTwo.map((s, i) => {
                            return (
                              <Col
                              className="p-2 d-flex align-items-center "
                              md={6}
                              key={i}
                            >
                              <Check size={16} className="text-50 me-2" />
                              <p className="mb-0"> {s} </p>
                            </Col>
                            );
                          })}
                        </Row>
                      </Collapse>
                    )}{" "}
                    {/* FIN SEGUDO COLLAPSE */}
                  </Collapse>
                </div>
              </section>
            )}
          </>
        ) //isNotFound
      }{" "}
      {/* isNotFound END */}
      {/* COURSE DESCRIPTION */}
      <section className=" w-sections mt-5 ">
        <p className="fs-22 fw-bold">Descripción del curso</p>
        <div className="course-description-container p-4">
          <p className="fw-bold fs-20"> {courseInfo.longDescription.title} </p>
          <p> {courseInfo.longDescription.description} </p>
        </div>
      </section>
      {/* COURSE CONTENT */}
      <section className="course-content-container w-sections mt-5">
        <div className="">
          <p className="fs-22 fw-bold">Contenido del curso</p>
        </div>

        <CollapseAntd onChange={() => {}} items={courseContent}></CollapseAntd>
      </section>
      {/* COURSE CONTENT */}
      <section className="w-sections mt-5">
        <div className="">
          <p className="fs-22 fw-bold">Comentarios</p>
        </div>

        {
          (isEmpty(courseInfo.commentsCourse) === true || isNil(courseInfo.commentsCourse) === true) && (
            <>
              <div className="w-sections text-center">
                <p className="mb-0 fw-bold fs-20">Aún no hay comentarios</p>
                <p className="mb-0 fw-bold fs-20">
                  ¡Se el primero en comentar este curso!
                </p>
                <div className="comment-image mt-3">
                  <img src={commentsImg} alt="" />
                </div>
                <div>
                  <button
                    className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center"
                    onClick={() => {
                      if (isAuth === false || isNil(isAuth) === true) {
                        return simpleAlertTimer({
                          title: "Necesitas iniciar sesión para poder comentar",
                          icon: "info",
                        });
                      }

                      setShowModalComment(true);
                    }}
                  >
                    <MessageCircle size={18} className="me-2" />Comentar
                  </button>
                </div>
              </div>
            </>
          )
        }

        {isEmpty(courseInfo.commentsCourse) === false &&
          isNil(courseInfo.commentsCourse) === false && (
            <div>
              <Spin spinning={loaderModalComment} tip={'Cargando...'}>
                <Carousel itemsToShow={2} className="">
                  {courseInfo.commentsCourse.map((c) => {
                    return (
                      <>
                        <div className="comment-card p-3">
                          <div className="d-flex align-items-center">
                            <p className="mb-0 badge bg-primary fs-20 me-2">
                              {c.userName.substring(0, 1)}
                            </p>

                            <p className="mb-0 me-2 fw-bold">
                              {c.userName.toLocaleUpperCase()}
                            </p>

                            <p className="mb-0 me-4 d-flex">
                              {(makeScore(c.score, true) as boolean[])?.map((isFilled, i) => (
                                <Star key={i} size={14} className={isFilled ? "text-warning" : "text-secondary"} fill={isFilled ? "#ffc107" : "none"} />
                              ))}
                            </p>
                          </div>
                          <div>
                            <p className="mb-0">{c.comment}</p>
                          </div>
                        </div>
                      </>
                    );
                  })}
                </Carousel>

                <div className="text-end">
                  <button
                    className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center"
                    onClick={() => {
                      if (isAuth === false || isNil(isAuth) === true) {
                        return simpleAlertTimer({
                          title: "Necesitas iniciar sesión para poder comentar",
                          icon: "info",
                        });
                      }

                      setShowModalComment(true);
                    }}
                  >
                    <MessageCircle size={18} className="me-2" />Comentar
                  </button>
                </div>
              </Spin>
            </div>
          )}
      </section>
      {/* COURSE TEACHER */}
      <section className="w-sections mt-5">
        <div className="">
          <p className="fs-22 fw-bold">Acerca del instructor</p>
        </div>

        <div className="teacher-container p-3">
          <p className="fw-bold fs-20 mb-0 d-flex align-items-center">
            <UserCircle size={22} className="me-2" />
            {teacherInfo.name} {teacherInfo.lastName}
          </p>
          <p className="t-font-white mb-1"> {teacherInfo.typeUser} </p>
          <div className=" course-teacher-intro">
            <div className="teacher-image me-3">
              <img src={teacherInfo.picture || noPictureImg} alt="" />
            </div>
            <div>
              <p className="d-flex align-items-center">
                {" "}
                <Star size={16} className="text-primary me-2" /> Puntuación
                promedio : <span className="ms-1 fw-bold">{average.mark}</span>{" "}
              </p>
              <p className="d-flex align-items-center">
                {" "}
                <MessageCircle size={16} className="text-primary me-2" />{" "}
                Comentarios : <span className="ms-1 fw-bold">{average.comments}</span>{" "} <small className="fw-12 text-warning ms-1">(Totales de todos sus cursos)</small>
              </p>
              <p className="d-flex align-items-center">
                {" "}
                <Users size={16} className="text-primary me-2" /> Cantidad de
                estudiantes: <span className="ms-1 fw-bold">{average.studentes}</span>{" "}
              </p>
              <p className="d-flex align-items-center">
                {" "}
                <Book size={16} className="text-primary me-2" /> cursos:{" "}
                <span className="ms-1 fw-bold">{average.courses}</span>{" "}
              </p>
            </div>
          </div>

          <div className="text-end">
            <Link to={`/course/by-teacher/${courseInfo.idTeacher}`}>
              <button className="btn btn-outline-warning d-inline-flex align-items-center justify-content-center">
                <GraduationCap size={18} className="me-2" />
                Ver más cursos
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* // MODALES */}
      <Modal
        destroyOnClose={true}
        closable={false}
        open={showModalComment}
        footer={null}
        onCancel={() => {
          // setShowModalComment(false);
        }}
        centered={true}
      >
        <section>
          <Spin spinning={loaderModalComment} tip='Guardando comentario...' >
            <header>
              <p className="fs-18 fw-bold mb-0 d-flex align-items-center">
                <Feather size={20} className="text-primary me-2" /> Deja tu
                comentario u opinión acerca de este curso
              </p>
              <p className="mb-0 fs-12 text-danger mt-1">
                Recuerda no usar palabras ofensivas o tu comentario será eliminado
              </p>
            </header>

            <div className="mt-4">
              <Input.TextArea
                rows={4}
                placeholder="Máximo 200 carácteres"
                maxLength={200}
                value={addCommentInput.comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  const value = e.target.value;
                  setAddCommentInput({
                    ...addCommentInput,
                    comment: value,
                  });
                }}
              />
            </div>
            <div className="mt-3">
              <p className="d-flex align-items-center mb-2"> <Star size={16} className="text-warning me-2" fill="#ffc107" /> Agrega una calificación</p>
              <Radio.Group
                className=""
                onChange={(e: RadioChangeEvent) => {
                  setAddCommentInput({
                    ...addCommentInput,
                    score: Number(e.target.value),
                  });
                }}
                value={addCommentInput.score}
              >
                <Radio value={1}>1</Radio>
                <Radio value={2}>2</Radio>
                <Radio value={3}>3</Radio>
                <Radio value={4}>4</Radio>
                <Radio value={5}>5</Radio>
              </Radio.Group>
            </div>

            <div className="mt-4 text-end d-flex justify-content-end gap-2">
              <button className="btn btn-outline-danger btn-sm d-inline-flex align-items-center justify-content-center"
                onClick={() => {
                  setAddCommentInput({
                    comment: '',
                    score: 0
                  });
                  setShowModalComment(false);
                }}
              > <X size={16} className="me-2" /> Cerrar</button>
              
              <button className="btn btn-outline-primary btn-sm d-inline-flex align-items-center justify-content-center"
                onClick={() => {
                  addComment();
                }}
              > <Send size={16} className="me-2" /> Enviar comentario</button>
            </div>
          </Spin>
        </section>
      </Modal>
    </>
  );
};

export default InfoByCourseName;
