import blossoms from '../../assets/images/pink-blossoms.png';
import sunflower from '../../assets/images/sunflower-motif.png';
import swan from '../../assets/images/swan-motif.png';

const artwork = { blossoms, sunflower, swan };

export default function PageMotif({ kind = 'blossoms' }) {
  return (
    <div className={`page-motif page-motif--${kind}`} data-motif={kind} aria-hidden="true">
      <img src={artwork[kind]} alt="" draggable="false" />
    </div>
  );
}
