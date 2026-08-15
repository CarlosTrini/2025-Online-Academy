import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import "./InfoByCategory.scss";
import { cardCourseT, coursesT, teacherT } from "../../typesInterfaces/types";
import { isEmpty, isNil } from "lodash";
import { getStorageArr, getStorageObj, removeStorage, saveStorage } from "../../helpers/storagesFunc";
import { namesStorage } from "../../initData/namesStorage";

import notFoundCourse from "../../assets/not-found-course.svg";

import { levelT as levelTT } from "../../typesInterfaces/types";

import { Card, Radio, RadioChangeEvent, Spin } from "antd";
import CardCourse from "../../components/cardCourse/CardCourse";
import { Home, Users, Star, Clock, Hourglass, Zap, ChevronRight, Eraser } from "lucide-react";

type todosT = levelTT & {
  'Todos': string;
}

type filterT = {
  score: number;
  duration: string;
  // level: levelT | 'Todos';
  level: todosT
}

interface handleFiltersI<T>  {
  filter: string;
  value: T
}

type starsT = {
    2: JSX.Element[],
    3: JSX.Element[],
    4: JSX.Element[],
    5: JSX.Element[],
};


type levelT = {
  1: JSX.Element[],
  2: JSX.Element[],
  3: JSX.Element[],
  4: JSX.Element[]
};

const initFilters = {
  score: 0,
  duration: '0-100',
  level: 'Todos' as unknown as todosT
};

const InfoByCategory = () => {
  const PARAMS = useParams();

  const [coursesInfo, setCoursesInfo] = useState<cardCourseT[]>([]);
  const [loaderInfo, setLoaderInfo] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [areFiltersActive, setAreFiltersActive] = useState(false);
  const [students, setStudents] = useState(0);
  const [stars, setStars] = useState<starsT>({
    2: [],
    3: [],
    4: [],
    5: [],
  });
  const [levelIcons, setLevelIcons] = useState<levelT>({
    1: [],
    2: [],
    3: [],
    4: []
  });
  const [filters, setFilters] = useState<filterT>(initFilters);


  const applyFilters = (courses: coursesT[]) => {

    let coursesNew = [];
    const filtersStorage:filterT = getStorageObj({name: namesStorage.filtersStorage}) as filterT;

    if (isNil(filtersStorage) === true || isEmpty(filtersStorage) === true) {
      coursesNew = courses;
    } else {

      coursesNew = courses.reduce((acum:coursesT[], curr) => {

        // curr.level === filtersStorage.level

        const isAll =  (
          filtersStorage.level === 'Básico' ||
          filtersStorage.level === 'Intermedio' ||
          filtersStorage.level === 'Avanzado')
          ? false
          : true;


        if (
          curr.score >= filtersStorage.score &&
          (
            Number(curr.courseDuration) >= Number(filtersStorage.duration.split('-')[0]) &&
            Number(curr.courseDuration) <= Number(filtersStorage.duration.split('-')[1])
          )
        ) {
          if (isAll === true) {
            acum = [...acum, curr]
          }
          else {
            if (curr.level === filtersStorage.level) {
              acum = [...acum, curr]
            }
          }
        }
        return acum;
      }, []);

    }


    return coursesNew;


  }


  const searchCourses = (category: string) => {
    setLoaderInfo(true);

    let studentsQty = 0;
    const courses: coursesT[] = getStorageArr({ name: namesStorage.coursesStorage });

    if (isEmpty(courses) === true || category === "") {
      setLoaderInfo(false);
      return setIsNotFound(true);
    }

    const coursesFilter = courses.filter(c => c.category === category);
    setIsNotFound(false);


      // ==> ==> GET INFO DE LOS INSTRUCTORES
    const teachers = getStorageArr({ name: namesStorage.teachersStorage });

    const coursesWithFilters = applyFilters(coursesFilter);


    const coursesCards: cardCourseT[] = coursesWithFilters.map((t) => {

      // buscar al instructor para su nombre
      const teacherFilter: teacherT = teachers.find(
        (i: teacherT) => i.id === t.idTeacher
      );

      // sumarizar a los estudiantes
      studentsQty += t.students;


      return {
        level: t.level,
        duration: t.courseDuration,
        idCourse: t.id,
        imageCourse: t.image,
        idTeacher: t.idTeacher,
        titleCourse: t.title,
        score: t.score,
        price: t.price,
        category: t.category,
        discountPrice: t.discountPrice,
        studentsQty: t.students,
        teacherName: teacherFilter.name + " " + teacherFilter.lastName,
        lastUpdated: t.lastUpdated,
        shortDescription: t.shortDescription,
        skills: t.skills,
      };
    });

    // simular la petición de la data
    setTimeout(() => {
      setLoaderInfo(false);
      setCoursesInfo(coursesCards);
      setStudents(studentsQty);
    }, 1500);
  };

  function handleFilters<T>(data: handleFiltersI<T>) {
    const updateFilter = {
      ...filters,
      [data.filter]: data.value
    };

    setFilters(updateFilter);
    setAreFiltersActive(true);


    saveStorage({
      name: namesStorage.filtersStorage,
       value: JSON.stringify(updateFilter)
    });

    searchCourses(PARAMS.courseCategoryName || '');
  }

  const handleResetFIlters = () => {
    setFilters(initFilters);
    setAreFiltersActive(false);
    removeStorage({
      name: namesStorage.filtersStorage
    });
    searchCourses(PARAMS.courseCategoryName || '');
  }

  const makeStars = (fill: number) => {
    // DINÁMICO
    const empty = 5 - fill;
    const totalStars = [...Array(fill).fill(true), ...Array(empty).fill(false)];
    const htmlIcons = totalStars.map((isFilled, i) => (
      <Star key={i} size={16} className={isFilled ? "text-warning me-1" : "text-secondary me-1"} fill={isFilled ? "#ffc107" : "none"} />
    ));
    return htmlIcons;
  }

  const makeLevelIcons = (fill:number) => {

    let total = [];
    if (fill === 4) {
      return;
    }
    else {
      const empty = 3 - fill;
      total = [...Array(fill).fill(true), ...Array(empty).fill(false)];
    }

    const htmlIcons = total.map((isFilled, i) => (
      <ChevronRight key={i} size={16} className={isFilled ? "text-dark me-1" : "text-50 me-1"} />
    ));
    return htmlIcons;
  }

  const checkFilters = () => {
    const filtersStorage = getStorageObj({name: namesStorage.filtersStorage}) as filterT;
    if (isNil(filtersStorage) === false && isEmpty(filtersStorage) === false) {
      setFilters(filtersStorage);
    }
  }

  useEffect(() => {
    if (isNil(PARAMS.courseCategoryName) === false) {
      saveStorage({
        name: namesStorage.currentCategoryStorage,
        value: PARAMS.courseCategoryName,
      });
      searchCourses(PARAMS.courseCategoryName);
      checkFilters();
      setStars(
        {
          ...stars,
        "2": makeStars(2),
        "3": makeStars(3),
        "4": makeStars(4),
        "5": makeStars(5)
      });
      setLevelIcons({
        ...levelIcons,
        "1": makeLevelIcons(1) || [],
         "2": makeLevelIcons(2) || [],
         "3": makeLevelIcons(3) || []
      });
    }


    return(() => {
      removeStorage({name: namesStorage.filtersStorage});
      removeStorage({name: namesStorage.currentCategoryStorage});
    });
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
            Oops! no han sido encontrados cursos de esta categoría... Inténtalo más tarde...
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
            <Spin spinning={loaderInfo} size="large" >

            <section className="w-sections-90">
              <p className="fw-bold fs-28">Cursos: <span className="text-primary">{PARAMS.courseCategoryName} </span></p>
              <p className="d-flex align-items-center"><Users size={20} className="text-primary me-2" /> <span className="fw-bold fs-18">{students}{' '}</span> Estudiantes en esta categoría. </p>
            </section>

            <section className="w-sections-90 category-main">
              <div className="category-filters">
                <div>
                  <Card
                    title={
                      <p className="mb-0 fw-bold d-flex align-items-center"><Star size={18} className="text-50 me-2" /> Valoración</p>
                    }
                    bordered={true}
                    style={{ width: 250 }}
                  >
                    <Radio.Group
                      className="d-flex flex-column"
                      onChange={(e: RadioChangeEvent) => {
                        handleFilters({
                          filter: 'score',
                          value: Number(e.target.value)
                        });
                      }} value={filters.score}>
                        <Radio value={2}> {...stars[2]}  Apartir de 2</Radio>
                        <Radio value={3}> {...stars[3]}  Apartir de 3</Radio>
                        <Radio value={4}> {...stars[4]} Apartir de 4</Radio>
                        <Radio value={5}> {...stars[5]} Solo de 5</Radio>
                        <Radio value={0}>  Todos</Radio>
                    </Radio.Group>
                  </Card>
                </div>

                <div className="my-3">
                <Card
                  title={
                    <p className="mb-0 fw-bold d-flex align-items-center"><Clock size={18} className="text-50 me-2" /> Duración</p>
                  }
                  bordered={true}
                  style={{ width: 250 }}
                >
                    <Radio.Group
                      className="d-flex flex-column"
                      onChange={(e: RadioChangeEvent) => {
                        handleFilters({
                          filter: 'duration',
                          value: e.target.value
                        });
                      }} value={filters.duration}>
                        <Radio value={'1-5'} className="d-flex align-items-center"> <Hourglass size={14} className="text-dark me-1" /> Entre 1-5 horas</Radio>
                        <Radio value={'5-10'} className="d-flex align-items-center"> <Hourglass size={14} className="text-dark me-1" /> Entre 5-10 horas</Radio>
                        <Radio value={'10-20'} className="d-flex align-items-center"> <Hourglass size={14} className="text-dark me-1" /> Entre 10-20 horas</Radio>
                        <Radio value={'20-30'} className="d-flex align-items-center"> <Hourglass size={14} className="text-dark me-1" /> Entre 20-30 horas</Radio>
                        <Radio value={'30-100'} className="d-flex align-items-center"> <Hourglass size={14} className="text-dark me-1" /> Entre 30-100 horas</Radio>
                        <Radio value={'0-100'} className="d-flex align-items-center"> <Hourglass size={14} className="text-dark me-1" /> Cualquier duración</Radio>
                    </Radio.Group>
                </Card>
                </div>


                <div className="">
                <Card
                  title={
                    <p className="mb-0 fw-bold d-flex align-items-center"><Zap size={18} className="text-50 me-2" /> Nivel</p>
                  }
                  bordered={true}
                  style={{ width: 250 }}
                >
                    <Radio.Group
                      className="d-flex flex-column"
                      onChange={(e: RadioChangeEvent) => {
                        handleFilters({
                          filter: 'level',
                          value: e.target.value
                        });
                      }} value={filters.level}>
                        <Radio value={'Básico'}> {...levelIcons[1]} Básico </Radio>
                        <Radio value={'Intermedio'}> {...levelIcons[2]} Intermedio </Radio>
                        <Radio value={'Avanzado'}> {...levelIcons[3]} Avanzado </Radio>
                        <Radio value={'Todos'}>  Todos </Radio>

                    </Radio.Group>
                </Card>
                </div>

                      {
                        areFiltersActive === true && (
                          <div className="text-center mt-3">
                            <button 
                              className="btn btn-outline-danger d-inline-flex align-items-center justify-content-center"
                              onClick={() => {
                                handleResetFIlters();
                              }}
                              > <Eraser size={18} className="me-2" /> Eliminar filtros </button>
                          </div>

                        )
                      }
              </div>

              {/* SECCIÓN DE CARDS */}
              <div className="category-courses">
                <div>
                    <p className="fs-20">Cursos: <span className="fw-bold"> {coursesInfo.length} </span> </p>
                </div>


                <div className="courses-cards">

                  {coursesInfo.map((t) => (
                    <CardCourse open={true} {...t} key={t.idCourse} />
                  ))}
                  </div>

              </div>
            </section>

            </Spin>
          </>
        )
      }
    </>
  );
};

export default InfoByCategory;
