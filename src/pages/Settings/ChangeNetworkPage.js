import React, { useContext, useEffect, useState } from 'react';
import { getNetworks, getSwitches } from '../../adapter';

import { AppContext } from '../../AppProvider';
import { useNavigation } from '../../routes/hooks';
import { ROUTES_MAP } from './routes';
import { withTranslation } from '../../hooks/useTranslations';
import useUserConfig from '../../hooks/useUserConfig';

import GlobalLayout from '../../component-library/Global/GlobalLayout';
import CardButton from '../../component-library/CardButton/CardButton';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';

const ChangeNetworkPage = ({ t }) => {
  const navigate = useNavigation();
  const [{ networkId }, { changeNetwork }] = useContext(AppContext);
  const onSelect = targetId => changeNetwork(targetId);
  const { developerNetworks } = useUserConfig();

  const onBack = () => navigate(ROUTES_MAP.SETTINGS_OPTIONS);
  const [switches, setSwitches] = useState([]);
  const [networks, setNetworks] = useState([]);

  useEffect(() => {
    const load = async () => {
      const allSwitches = await getSwitches();
      const allNetworks = await getNetworks();
      // PRIMEROS AJUSTES - Roadmap: Filtrar por Developer Networks toggle
      // Fecha: 2025-10-31
      const filteredNetworks = allNetworks.filter(({ id, environment }) => {
        // Primero verificar si está habilitado en switches
        if (!allSwitches[id]?.enable) return false;
        // Si developerNetworks está OFF, solo mostrar mainnet
        if (!developerNetworks && environment !== 'mainnet') return false;
        return true;
      });
      setSwitches(allSwitches);
      setNetworks(filteredNetworks);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [developerNetworks]);

  return (
    <GlobalLayout>
      <GlobalLayout.Header>
        <GlobalBackTitle onBack={onBack} title={t(`settings.change_network`)} />

        {networks.map(({ id, name, icon }) => (
          <CardButton
            key={id}
            active={id === networkId}
            complete={id === networkId}
            title={name}
            image={icon}
            disabled={!switches[id]?.enable}
            onPress={() => onSelect(id)}
          />
        ))}
      </GlobalLayout.Header>
    </GlobalLayout>
  );
};

export default withTranslation()(ChangeNetworkPage);
