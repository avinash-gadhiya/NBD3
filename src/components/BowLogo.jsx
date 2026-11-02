import pinkBow from '../assets/images/pink-bow.png';

// The supplied satin bow, extracted onto a transparent background.
export default function BowLogo() {
  return (
    <img className="brand-mark" src={pinkBow} alt="" aria-hidden="true" width="40" height="40" />
  );
}
