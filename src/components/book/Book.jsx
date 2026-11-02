import { memo } from 'react';
import RightPage from './RightPage.jsx';
import DedicationPage from './DedicationPage.jsx';
import SecondPage from './SecondPage.jsx';
import ThirdPage from './ThirdPage.jsx';
import MotivationPage from './MotivationPage.jsx';
import Cover from './Cover.jsx';
import PortraitStand from './PortraitStand.jsx';
import PopUpFigure from './PopUpFigure.jsx';
import PaperCake from './PaperCake.jsx';
import friendsImage from '../../assets/images/friends.png';
import selfImage from '../../assets/images/self.png';
import selfMirrorImage from '../../assets/images/self-mirror.png';
import catImage from '../../assets/images/cat.png';
import puppyImage from '../../assets/images/puppy.png';
import thirdFriendsImage from '../../assets/images/third-friends.png';
import thirdSelfImage from '../../assets/images/third-self.png';

/*
 * Static 3D markup; bookController writes every per-frame transform through these refs.
 * Each leaf carries its spread's pop-ups. Turning both leaves reveals page 3;
 * the back of each leaf becomes the next spread's left page.
 */
function Book({ refs, content }) {
  return (
    <div className="scene" ref={refs.scene}>
      <div className="book" ref={refs.book}>
        <ThirdPage content={content} pageRef={refs.pageThree} />
        <div className="spine"></div>
        <PortraitStand image={thirdFriendsImage} label="An illustrated portrait of two friends celebrating how far they have come" standRef={refs.thirdStand} leftRef={refs.thirdLeft} rightRef={refs.thirdRight} />
        <PopUpFigure image={thirdSelfImage} alt="An illustrated seated mirror selfie with long hair and clear glasses" className="third-self-stand" figureRef={refs.thirdSelf} />
        <div className="leaf leaf-two" ref={refs.leafTwo}>
          <SecondPage content={content} pageRef={refs.pageTwo} />
          <MotivationPage content={content} />
          <PortraitStand image={selfImage} label="Her own portrait, folded up from the second page" standRef={refs.selfStand} leftRef={refs.selfLeft} rightRef={refs.selfRight} />
          <PopUpFigure image={selfMirrorImage} alt="Her mirror selfie, standing up from the second page" className="mirror-stand" figureRef={refs.mirror} />
          <PopUpFigure image={puppyImage} alt="A fluffy paper puppy waving hello" className="puppy-stand" figureRef={refs.puppy} />
        </div>
        <div className="leaf" ref={refs.leaf}>
          <RightPage content={content} />
          <DedicationPage content={content} />
          <PortraitStand image={friendsImage} label="An illustrated portrait of the two friends folded up from the birthday card" standRef={refs.portrait} leftRef={refs.portraitLeft} rightRef={refs.portraitRight} />
          <PopUpFigure image={catImage} alt="One black and white paper kitten beside the birthday cake" className="cat-body-stand" figureRef={refs.cat} />
          <PaperCake cakeRef={refs.cake} leftRef={refs.cakeLeft} rightRef={refs.cakeRight} />
        </div>
        <Cover coverRef={refs.cover} content={content} />
      </div>
    </div>
  );
}

export default memo(Book);
