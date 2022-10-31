import { useEffect, useState } from 'react';
import DeviceCrypto, { AccessLevel } from 'react-native-device-crypto';
const smkey_alias = 'SALMON_KEY';

const useBiometrics = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [type, setType] = useState();
  useEffect(() => {
    DeviceCrypto.isBiometryEnrolled().then(async available => {
      setIsAvailable(available);
      if (available) {
        const bioType = await DeviceCrypto.getBiometryType();
        setType(bioType);
      }
    });
  }, []);

  const lock = async value => {
    await DeviceCrypto.getOrCreateSymmetricKey(smkey_alias, {
      accessLevel: AccessLevel.AUTHENTICATION_REQUIRED,
      invalidateOnNewBiometry: false,
    });
    const encrypted = DeviceCrypto.encrypt(smkey_alias, value, {
      biometryTitle: 'Access',
      biometrySubTitle: 'Registering your security',
      biometryDescription: 'Registering your security',
    });
    return encrypted;
  };

  const unlock = async value => {
    return await DeviceCrypto.decrypt(
      smkey_alias,
      value.encryptedText,
      value.iv,
      {
        biometryTitle: 'Authentication is required',
        biometrySubTitle: 'Encryption',
        biometryDescription: 'Authenticate your self to encrypt given text.',
      },
    );
  };

  const remove = async () => {
    const status = await DeviceCrypto.deleteKey(smkey_alias);
    return status;
  };

  return [
    { isAvailable, type },
    { lock, unlock, remove },
  ];
};

export default useBiometrics;
