import ChoicePoint1 from './ChoicePoint1';
import ChoicePoint2 from './ChoicePoint2';
import ChoicePoint3 from './ChoicePoint3';

export { ChoicePoint1, ChoicePoint2, ChoicePoint3 };

export type ChoicePointVariant = 'choice1' | 'choice2' | 'choice3';

interface ChoicePointProps {
  variant: ChoicePointVariant;
  style?: any;
}

export const ChoicePoint: React.FC<ChoicePointProps> = ({ variant, style }) => {
  switch (variant) {
    case 'choice1':
      return <ChoicePoint1 style={style} />;
    case 'choice2':
      return <ChoicePoint2 style={style} />;
    case 'choice3':
      return <ChoicePoint3 style={style} />;
    default:
      return <ChoicePoint1 style={style} />;
  }
};

export default ChoicePoint; 