import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Type definition for Material Community Icons names
 * This ensures type safety when using icon names in components
 */
export type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name']; 