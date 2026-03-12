/**
 * Widget Registry for RJSF
 * Maps custom widget names to their React components.
 * This is passed to the RJSF Form component as the `widgets` prop.
 */
import type { RegistryWidgetsType } from '@rjsf/utils';
import AssetRelationWidget from '../components/widgets/AssetRelationWidget';
import AssetUrlWidget from '../components/widgets/AssetUrlWidget';
import DateRangeWidget from '../components/widgets/DateRangeWidget';
import TagsWidget from '../components/widgets/TagsWidget';
import SwitchWidget from '../components/widgets/SwitchWidget';

/**
 * All custom widgets for RJSF.
 * Widget names here must match the `ui:widget` values in the uiSchema.
 */
export const customWidgets: RegistryWidgetsType = {
  AssetRelationWidget,
  AssetUrlWidget,
  DateRangeWidget,
  TagsWidget,
  SwitchWidget,
};

export default customWidgets;
