// if you want to import a module from shared/js then you can
// just do e.g. import Scatter from "shared/js/scatter.js"
// if you want to import a module from shared/js then you can
// just do e.g. import Scatter from "shared/js/scatter.js"
import { render, h, Fragment } from "preact";
import SocialBar from 'shared/js/SocialShare';
import {$, $$} from 'shared/js/util';
import RelatedContent from "shared/js/RelatedContent";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import Body from "./Body";
import store, { ACTION_SET_SECTIONS, fetchData, assetsPath, ACTION_SET_VIEW } from "./store";
import {SwitchTransition, Transition, TransitionGroup} from "react-transition-group";
import { IconBackArrow, IconCabin, IconSkyactive, IconSound, IconStyle, IconSustainable, Logo, ScrollDown, IconExplore} from "./Icons";
import {Provider, useSelector, useDispatch} from "react-redux";
import { useEffect, useRef, useState } from "preact/hooks";
import HoverButton from "./HoverButton";

gsap.registerPlugin(ScrollTrigger);

gsap.defaults({
    duration: 0.8,
    ease: 'sine.inOut'
});

const setHtml = (html) => ({__html: html});

const scrollToTop = () => {
    const t = document.getElementById('feature-top');
    // if (Math.abs(t - window.scrollY) < 200) {
    //     return false;
    // } 
    t.scrollIntoView({
        behavior: 'smooth'
    });
    return false;
}

const Container = ({children}) => {
    return (
        <div className="md:container  md:mx-auto">
            {children}
        </div>
    )
}
// const FlexContainer = (props) => {
const FlexContainer = ({children, className}) => {
    return (
        <div className={`flex-container ${className}`} >
            {children}
        </div>
    )
}


const Loading = () => 
    <FlexContainer className="loading">
        <div style={{width: 300}}>
            <img src={`${assetsPath}/glab_logo.svg`} />
        </div>
    </FlexContainer>


const Attribution = ({content}) => {
    return (
        <div className="attribution">
            <p>Paid for by 
                <a href={content.logoLink} target="_blank">
                    <Logo />
                </a>
            </p>
        </div>
    )
}

const ClientHubLink = ({children, href = '#'}) => 
    <div className="client-hub-link">
        <a href={href} target="_blank">{children}</a>
    </div>

const Header = () => {
    const content = useSelector(s=>s.content);

    return (
        <div>
            <div className="header relative">
                <Attribution content={content} />
                <div className="lg:grid lg:grid-cols-2">
                    <div className="bg md:order-2"
                        style={`background-image: linear-gradient(360deg, rgba(0,0,0,0.7) 10%, transparent 40%), url('${assetsPath}/hero.jpg');`}>
                        
                    </div>
                    <div className="flex items-center">
                        <div className="title">
                            <ClientHubLink href={content.hubLink}>{content.hubLabel}</ClientHubLink>
                            <h1 className="">{content.headline}</h1>
                            <div className="subhead" dangerouslySetInnerHTML={setHtml(content.subhead)}></div>
                        </div>
                    </div>
                </div>
                <div className="prompt">
                    <ScrollDown />
                </div>
            </div>
        </div>        
    )
}

const Footer = ({content, related, shareUrl}) => {

    return (
        <Fragment>

            <section className="footer dark-text px-2">
                <div className="content">
                    <div className="cta-wrap">
                        <div className="cta" dangerouslySetInnerHTML={setHtml(content.cta)} />
                        <div className="share">
                            <SocialBar title={content.shareTitle} url={shareUrl} />
                        </div>
                    </div>
                    
                </div>
            </section>

            <section className="related p-8">
                    <div className="mx-auto" >
                        <h3>Related content</h3>
                        <RelatedContent cards={related} />
                    </div>
            </section>
        </Fragment>
    )
}

const Standfirst = ({content}) => {

    return (
        <div className="standfirst">
                <div className="content" dangerouslySetInnerHTML={setHtml(content.standfirst)}></div>
        </div>
    )
}
const SmoothScroll = ({children}) => {
    const app = useRef();
    const [pos, setPos] = useState(window.scrollY);
    useEffect(()=>{
        window.addEventListener('scroll', (e) => {
            e.preventDefault();
            const dy = pos-window.scrollY;
            console.log(Math.max(-2100, dy));
            setPos(window.scrollY);
            gsap.to(app.current, {duration: 0.5, y: Math.max(-2100, dy), ease: 'sine.out'});
        });
    },[])
    return (
        <div ref={app}>
            {children}
        </div>
    )
}

const MainBody = ({children}) => {
    const mainRef = useRef();

    useEffect(()=>{
        const resize = () => {
            mainRef.current.style.height = mainRef.current.scrollHeight * 0.5 + 'px';
            // console.log(mainRef.current.scrollHeight, mainRef.current.scrollHeight * 0.5 + 'px');
            
        }
        window.addEventListener('resize', resize);

        resize();

        return () => window.removeEventListener('resize', resize);
    },[]);

    return (
        <div className="main" ref={mainRef}>
            {children}
        </div>
    )
}

const HotSpot = ({onClick, feature, children}) => {
    const ref = useRef();
    useEffect(()=>{
        const hb = new HoverButton(ref.current);
        return () => {
            hb.destroy();
        }
    },[])

    const handleOver = () => {
        ref.current.querySelector('.hover').setAttribute('stroke-dashoffset', 0);
    }
    const handleOut = () => {
        ref.current.querySelector('.hover').setAttribute('stroke-dashoffset', 200);
    }
    return (
        <a ref={ref} href="#" 
        onMouseOver={handleOver} 
        onMouseOut={handleOut} 
        onClick={onClick} className={`btn-feature btn-${feature.toLowerCase()}`}>
            {children}
        </a>
    )
}


const Section = ({content}) => {

    const dispatch = useDispatch();

    const featureRef = useRef();

    const handleClick = (v) => {

        return (e) => {
            e.preventDefault();
            console.log(v);

            const tl = gsap.timeline({
                onComplete: () => {
                    if (scrollToTop()) gsap.delayedCall(0.5, () => dispatch({type: ACTION_SET_VIEW, payload: v}));
                    else dispatch({type: ACTION_SET_VIEW, payload: v});
                }
            })
            tl
            .to(Array.from(featureRef.current.querySelectorAll('.btn-feature')), {stagger: 0.05, scale: 0, ease: 'back.in'})
            .to(featureRef.current.querySelector('nav'), {alpha: 0},'<0.3')
            // .to(featureRef.current.querySelector('.standfirst'), {alpha: 0, y: -100},'<')
        }
    }
    const iconComponenets = {
        'sound': IconSound,
        'cabin': IconCabin,
        'style': IconStyle,
        'skyactive': IconSkyactive,
        'sustainable': IconSustainable
    };
    const buttons = ['Sound', 'Cabin','Skyactive','Style','Sustainable'].map(
        (v)=>
            <HotSpot onClick={handleClick(v.toLowerCase())} feature={v.toLowerCase()}>
                {h(iconComponenets[v.toLowerCase()])}
            </HotSpot>
    );
    return (
        <section ref={featureRef}>
            <Standfirst content={content} />
            <div className="bg">

                <div className="feature-home flex-col">
                        <div className="nav-container">
                            <nav>
                                {buttons}
                            </nav>
                        </div>
                        <div className="flex justify-center">
                            <div className="prompt flex justify-center">
                                <i><IconExplore /></i><span>{content.prompt}</span>
                            </div>

                        </div>
                </div>
            </div>
            
        </section>
    )
}
const FeatureTitle = ({title}) => {
    return (
        <h2 className="feature-title text-center">{title}</h2>
    )
}

const FeatureBack = () => {
    const dispatch = useDispatch();



    const handleClick = (e) => {
        e.preventDefault();
        if (scrollToTop()) gsap.delayedCall(0.5, () => dispatch({type: ACTION_SET_VIEW, payload: 'home'}));
        else dispatch({type: ACTION_SET_VIEW, payload: 'home'});
    }

    return <a href="#" className="btn-back" onClick={handleClick}><IconBackArrow /> Back</a>;
}

const ImageGrid = ({type, assets}) => {
    const assetList = assets.split(',');
    switch (type) {
        case 'row2a':
            return (
                <Fragment>
                    <img src={`${assetsPath}/${assetList[0]}`} alt="" />
                    <div className="md:grid md:grid-cols-2 gap-2">
                        <img src={`${assetsPath}/${assetList[1]}`} alt="" />
                        <img src={`${assetsPath}/${assetList[2]}`} alt="" />
                    </div>
                </Fragment>
            )
            break;
        case 'row2b':
            return (
                <Fragment>
                    <div className="md:grid md:grid-cols-1 gap-2">
                        <img src={`${assetsPath}/${assetList[0]}`} alt="" />
                        <img src={`${assetsPath}/${assetList[1]}`} alt="" />
                    </div>
                </Fragment>
            )
            break;
        case 'row1':
            return (
                <Fragment>
                <div className="md:flex">
                    <img className="md:w-3/5 md:mr-2"  src={`${assetsPath}/${assetList[0]}`} alt="" />
                    <img className="md:w-2/5"  src={`${assetsPath}/${assetList[1]}`} alt="" />
                </div>
            </Fragment>
            )
        default:
            return (
                <Fragment>
                    <div className="md:flex">
                        <img className="md:w-2/5 md:mr-2" src={`${assetsPath}/${assetList[0]}`} alt="" />
                        <img className="md:w-3/5" src={`${assetsPath}/${assetList[1]}`} alt="" />
                    </div>
                </Fragment>
            )
    }
}

const Feature = ({content}) => {
    const featRef = useRef();

    useEffect(()=>{
        console.log('mount')
        gsap.set(featRef.current, {alpha: 0});
    },[]);

    const handleHeaderLoaded = () => {
        console.log('header loaded');
        gsap.timeline()
        .from(featRef.current.querySelector('header'),{duration: 3, scale: 1.2, ease:'sine.out'})
        .from('#crect', { attr: { height: '0%'}, duration: 0.8, ease:'sine.out'},0.1)
        .from(featRef.current.querySelector('.title'),{alpha: 0, y: 50, duration: 1},'>-.1')
        .from(Array.from(featRef.current.querySelectorAll('p')),{alpha: 0, y: 50, duration: 1},'>')
        .to(featRef.current, {alpha: 1, duration: 0.4}, 0);
        // .from(Array.from(featRef.current.querySelectorAll('.image-grid img')),{alpha: 0,},'<0.3')
        // gsap.set(featRef.current, {alpha: 1});

        // Array.from(featRef.current.querySelectorAll('.image-grid img')).forEach((v)=>{
        //     console.log(v);
        //     ScrollTrigger.create({
        //         trigger: v,
        //         start: "top bottom",
        //         animation: gsap.to(v, {scale: 2.1}),
        //         scrub: true
        //       });        
        // });
        
        // gsap.from('#crect', {duration: 0.4, attr:{y:'50%'}});
        // gsap.to('#crect', { duration: 1, attr: { height: '100%'}, delay: 0.4, ease:'sine.out'});
        Array.from(featRef.current.querySelectorAll('.image-grid img,.image-grid video')).forEach((v)=>{

            ScrollTrigger.create({
                trigger: v,
                start: "top 70%",
                // end: 'bottom 70%',
                animation: gsap.from(v, {alpha: 0, y: 100}),
                // markers: true,
                // scrub: true
              });
        })
        setTimeout(()=>{ScrollTrigger.refresh()}, 100);        
    }
    
    const Hero = () => {
        if (content.hero.indexOf('mp4')>=0) {
            return <video className="mx-auto" onLoadedMetadata={handleHeaderLoaded} muted autoPlay loop playsInline src={`${assetsPath}/${content.hero}`} />
        } else {
            return <img src={`${assetsPath}/${content.hero}`} onLoad={handleHeaderLoaded} alt="" />
        }
    }

    return (
        <section ref={featRef} className="feature" style={{opacity: 0}}>
            <div className="container mx-auto p-8">
                <FeatureBack />
            </div>
            <div className="md:container mx-auto">                
                <header className="relative">
                    <svg className="clip absolute t-0 l-0" width="100%" height="100%" viewbox="0 0 400 200" version="1.1">
                        <clipPath  id="clipper">
                            <rect id="crect" width="100%" height="100%" x="0" y="0%" fill="red" />
                        </clipPath>
                    </svg>                
                    {Hero()}
                    <div className="title">
                        <FeatureTitle title={content.heading} />
                    </div>
                </header>
            </div>
            <div className="container mx-auto p-8">
                <article>
                    <div className="above-fold" dangerouslySetInnerHTML={setHtml(content.aboveFold)} />
                    <div className="image-grid">
                        <ImageGrid type={content.gridType} assets={content.grid} />
                    </div>
                    <div className="below-fold" dangerouslySetInnerHTML={setHtml(content.belowFold)} />
                </article>
            </div>
            <div className="container mx-auto p-8">
                <FeatureBack />
            </div>

        </section>
    )
}

const Main = () => {
    const loaded = useSelector(s=>s.dataLoaded);
    
    const dispatch = useDispatch();



    useEffect(()=>{
        dispatch( fetchData('https://interactive.guim.co.uk/docsdata/1EuYYV92MOwjxR0BUOUamKo311i2GmMCqH84oRTzB3HM.json') );
    },[]);


    

    const content = useSelector(s=>s.content);
    const uiView = useSelector(s=>s.UI.view);

    const store = useSelector(s=>s);    

    const getCurrentView = () => {
        switch (uiView) {
            case 'home':
                return <Section content={content} />;
            default:
                return <Feature view={uiView} content={content.sections[uiView]} />;
        }
    }
    
    if (!loaded) return <Loading />;
    // return (
    //     <MainBody>
    //         <Header />

    //         <div id="feature-top"></div>
    //         <div className="feature-container">

            
    //         <SwitchTransition>
    //             <Transition
    //                 key={uiView}
    //                 timeout={200}
    //                 onEnter={n=>gsap.from(n,{duration:.2, alpha: 0})}
    //                 onExit={n=>gsap.to(n,{duration:.2, alpha:0})}
    //                 mountOnEnter
    //                 unmountOnExit
    //                 appear={true}
    //                 >
    //                     {getCurrentView()}
    //                 </Transition>
    //         </SwitchTransition>
    //         </div>
    //         {/* <Section content={content} />
    //         <Feature /> */}
    //         <Footer content={content} related={store.sheets.related} shareUrl={store.sheets.global[0].shareUrl} />
    //     </MainBody>
    // )

    return (
        <SwitchTransition>
            <Transition
                key={loaded}
                timeout={1000}
                onEnter={n=>gsap.from(n,{alpha: 0})}
                onExit={n=>gsap.to(n,{alpha:0})}
                mountOnEnter
                unmountOnExit
                appear={true}
            >
                {!loaded && <Loading />}
                {loaded &&
                    
                    <MainBody>
                            <Header />

                            <div id="feature-top"></div>
                            <div className="feature-container">

                            
                            <SwitchTransition>
                                <Transition
                                    key={uiView}
                                    timeout={200}
                                    onEnter={n=>gsap.from(n,{duration:.2, alpha: 0})}
                                    onExit={n=>gsap.to(n,{duration:.2, alpha:0})}
                                    mountOnEnter
                                    unmountOnExit
                                    appear={true}
                                    >
                                        {getCurrentView()}
                                    </Transition>
                            </SwitchTransition>
                            </div>
                            {/* <Section content={content} />
                            <Feature /> */}
                            <Footer content={content} related={store.sheets.related} shareUrl={store.sheets.global[0].shareUrl} />
                        </MainBody>
                }
            </Transition>            
        </SwitchTransition>
    )
}


const App = () => {
    return (
        <Provider store={store}>
            <Main/>
        </Provider>

    )
}

render( <App/>, document.getElementById('Glabs'));

