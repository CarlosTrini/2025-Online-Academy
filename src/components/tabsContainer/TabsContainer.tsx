import React, { useContext, useEffect, useState } from "react";
import { Spin, Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import { Globe, Cpu, Utensils, UserCheck, Brain, Camera, Video, Pill, Leaf, Link as LinkIcon } from "lucide-react";
import Carousel from 'next-elastic-carousel';
import "react-multi-carousel/lib/styles.css";

import type {
  cardCourseT,
  courseCategoriesT,
  coursesT,
  teacherT,
} from "../../typesInterfaces/types";

import noContent from '../../assets/noContent.png';

import "./tabsContainer.scss";
import { getStorageArr } from "../../helpers/storagesFunc";
import { namesStorage } from "../../initData/namesStorage";
import { isEmpty, isNil } from "lodash";

import CardCourse from "../cardCourse/CardCourse";
import { CategoryContextHook } from "../../context/categoryContextProvider";

type tabNamesT = {
  tabName: string;
  tabKey: string | number;
  icon: string;
};

type tabT = tabNamesT & {
  coursesData: cardCourseT[];
  tabShortDesc: string;
};

const tabsDescriptions = {
  "Desarrollo web":
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident",
  "Desarrollo web-icon": "Globe",
  Programación:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident",
  "Programación-icon": "Cpu",
  Gastronomía:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident",
  "Gastronomía-icon": "Utensils",
  "Superación personal":
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident",
  "Superación personal-icon": "UserCheck",
  Psicología:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident",
  "Psicología-icon": "Brain",
  Fotografía:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident",
  "Fotografía-icon": "Camera",
  Video:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident",
  "Video-icon": "Video",
  Medicina:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident",
  "Medicina-icon": "Pill",
  Herbolaria:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, veritatis Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis, provident",
  "Herbolaria-icon": "Leaf",
};

const IconComponent = ({ IconName, ...props }: any) => {

  return <IconName {...props} />;
};

const TabsContainer = () => {

  const NAVIGATE = useNavigate();
  const { updateCurrentCategory } = useContext(CategoryContextHook);

  // TODO
  const [tabKey, setTabKey] = useState("1");
  const [tabsNames, setTabsNames] = useState<tabNamesT[]>([]);
  const [loaderCards, setLoaderCards] = useState(true);
  const [currentTabName, setCurrenTabName] = useState<
    courseCategoriesT | string
  >("Desarrollo web");
  const [TabsCards, setTabCards] = useState<tabT[]>([]);

  const makeTabsNames = () => {
    const categories: courseCategoriesT[] = getStorageArr({
      name: namesStorage.categoriesStorage,
    });

    const tabsN: tabNamesT[] = categories.map((c, i) => {
      return {
        tabName: c,
        tabKey: i,
        icon: tabsDescriptions[`${c}-icon`],
      };
    });
    setTabsNames(tabsN);
  };

  const saveCurrentCategoryAndNavigate = (currentCategory: courseCategoriesT) => {
    // COMO NO SE TIENE UN MANEJADOR DE ESTADOS Y ESO, PARA AFECTAR EL SELECT DE CATEGORÍA
    //EN EL HEADER, USARMOS LOCALSTORAGE
    updateCurrentCategory(currentCategory);

    setTimeout(() => {
      NAVIGATE(`/course/by-category/${currentCategory}`)
    }, 500);
  }

  const makeCards = (currTab: courseCategoriesT | string) => {
    setLoaderCards(true);
    let tabsData: tabT[] = [];

    setTimeout(() => {
      const courses: coursesT[] = getStorageArr({
        name: namesStorage.coursesStorage,
      });
      const categories: courseCategoriesT[] = getStorageArr({
        name: namesStorage.categoriesStorage,
      });

      const teachers: teacherT[] = getStorageArr({
        name: namesStorage.teachersStorage,
      });

      if (isEmpty(courses) === true && isNil(courses) === true) {
        return tabsData;
      }

      // se filtra por el curso necesario
      const cardsFilter = courses.filter((f) => f.category === currTab);
      // con los cursos tomar la data necesaria para armar cada card
      const allCards: cardCourseT[] = cardsFilter.map((c) => {
        const teacher = teachers.find((t) => t.id === c.idTeacher);

        return {
          shortDescription: c.shortDescription,
          skills: c.skills,
          lastUpdated: c.lastUpdated,
          duration: c.courseDuration,
          level: c.level,
          idCourse: c.id,
          imageCourse: c.image,
          idTeacher: c.idTeacher,
          teacherName:
            isNil(teacher) === false
              ? teacher.name + " " + teacher.lastName
              : "",
          titleCourse: c.title,
          score: c.score,
          price: c.price,
          category: c.category,
          discountPrice: c.discountPrice,
          studentsQty: c.students,
        };
      });

      const acum: tabT[] = [];

      tabsData = categories.reduce((acum, curr, i) => {
        // de las cards "allCards" extraeremos por categoria...
        const courseInfo = allCards.filter((card) => card.category === curr);

        if (isNil(courseInfo) === true || isEmpty(courseInfo) === true) {
          return acum;
        }
        acum = [
          ...acum,
          {
            tabName: curr,
            tabKey: i,
            coursesData: courseInfo,
            tabShortDesc: tabsDescriptions[curr],
            icon: tabsDescriptions[`${curr}-icon`],
          },
        ];

        return acum;
      }, acum);

      setLoaderCards(false);
      setTabCards(tabsData);
    }, 1500); // FIN DEL TIMEOUT
  };

  useEffect(() => {
    if (isEmpty(tabsNames) === true) {
      makeTabsNames();
    }
    makeCards(currentTabName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTabName]);

  return (
    <>
      <Spin spinning={loaderCards} size="large">
        <Tabs
          defaultActiveKey={tabKey}
          onTabClick={(key, event: React.KeyboardEvent<Element> | React.MouseEvent<Element>) => {
            setTabKey(key);
            setCurrenTabName(event.currentTarget.children[0].id); // es el event de lo que esta en la prop tab de <Tabs.TabPane> // SACA EL ID DEL ELEMENTO <P>
          }}
          destroyInactiveTabPane={true}
        >
          {tabsNames.map((t) => {
            return (
              <Tabs.TabPane
                key={t.tabKey}
                style={{ minHeight: 200 }}
                tab={
                  <>
                    <p className="mb-0 badge py-2 text-bg-primary" id={t.tabName}>
                      {/* IconComponent(iconName={t.icon}, color="#000", size={20}) */}
                      {t.tabName}
                    </p>
                  </>
                }
              >
                {/* EN CASO DE QUE EL ARRAY CON LOS CURSOS ESTE VACÍO */}
                {
                  (isNil(TabsCards) === true || isEmpty(TabsCards) === true) && (
                    <>
                      <div className='mt-3'>
                        <div className="tab-no-content-img">
                          <img src={noContent} alt="" />
                        </div>
                      </div>
                      <p className="mb-0 fw-bold fs-18 text-center">Ops, lo sentimos ha ocurrido un error </p>
                      <p className="mb-0 fw-bold fs-18 text-center">o no hay cursos disponibles en esta categoría</p>
                      <p className="mb-0 fw-bold fs-18 text-center">da click al tab nuevamente.</p>
                    </>
                  )
                }

                {/* TODO OK, CARDS CON CONTENIDO */}
                {(isNil(TabsCards) === false && isEmpty(TabsCards) === false) && TabsCards.map((tab) => {
                  return (
                    <section className="tab-section">
                      <h3 className="text-success">
                        <i className={`${tab.icon} me-2`} />
                        Aprende de {tab.tabName}
                      </h3>
                      <p className="tab-description">{tab.tabShortDesc}</p>
                      <div className="mb-3">
                        <button className="btn btn-outline-dark d-inline-flex align-items-center justify-content-center"
                          onClick={() => {
                            saveCurrentCategoryAndNavigate(tab.tabName as courseCategoriesT);
                          }}
                        >
                          <LinkIcon size={16} className="me-2" />
                          {tab.tabName}
                        </button>
                      </div>
                      <div className="p-2">
                        <Carousel
                          // responsive={responsive} 
                          // itemClass="w-auto" 
                          itemsToShow={4}
                          className="w-auto"
                        >
                          {tab.coursesData.map((t) => (
                            <CardCourse open={true} {...t} key={t.idCourse} />
                          ))}
                        </Carousel>
                      </div>
                    </section>
                  );
                })}{" "}
                {/* FIN tabCards */}
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </Spin>
    </>
  );
};

export default TabsContainer;
