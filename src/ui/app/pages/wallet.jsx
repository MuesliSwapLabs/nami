import React from 'react';
import { Button } from '@chakra-ui/button';
import { useHistory } from 'react-router-dom';
import {
  createAccount,
  deleteAccount,
  displayUnit,
  getAccounts,
  getCurrentAccount,
  getNetwork,
  getTransactions,
  switchAccount,
  updateAccount,
} from '../../../api/extension';
import { Box, Spacer, Stack, Text } from '@chakra-ui/layout';

import {
  BsArrowDownRight,
  BsArrowUpRight,
  BsFillPersonPlusFill,
} from 'react-icons/bs';
import {
  Icon,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  LightMode,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  SettingsIcon,
  AddIcon,
  StarIcon,
  DeleteIcon,
  CopyIcon,
} from '@chakra-ui/icons';
import Scrollbars from 'react-custom-scrollbars';
import QrCode from '../components/qrCode';
import provider from '../../../config/provider';
import UnitDisplay from '../components/unitDisplay';
import { onAccountChange } from '../../../api/extension/wallet';
import AssetsViewer from '../components/assetsViewer';
import HistoryViewer from '../components/historyViewer';
import Copy from '../components/copy';

// Assets
import Logo from '../../../assets/img/logoWhite.svg';
import AvatarLoader from '../components/AvatarLoader';

const Wallet = ({ data }) => {
  const history = useHistory();
  const avatarBg = useColorModeValue('white', 'gray.800');
  const panelBg = useColorModeValue('teal.400', 'teal.900');
  const [state, setState] = React.useState({
    account: null,
    accounts: null,
    fiatPrice: 0,
  });
  const [menu, setMenu] = React.useState(false);
  const newAccountRef = React.useRef();
  const deletAccountRef = React.useRef();
  const [avatar, setAvatar] = React.useState({ avatar: '', name: '' }); // for quicker displaying

  const checkTransactions = async () => {
    const currentAccount = await getCurrentAccount();
    const transactions = await getTransactions();
    if (!currentAccount.history.confirmed.includes(transactions[0].txHash)) {
      await getData();
      return setTimeout(() => checkTransactions(), 10000);
    }
    return setTimeout(() => checkTransactions(), 10000);
  };

  const getData = async () => {
    setState((s) => ({ ...s, account: null, accounts: null }));
    const { avatar, name } = await getCurrentAccount();
    setAvatar({ avatar, name });
    await updateAccount();
    const currentAccount = await getCurrentAccount();
    const allAccounts = await getAccounts();
    const fiatPrice = await provider.api.price();
    const network = await getNetwork();
    // setState((s) => ({
    //   ...s,
    //   account: currentAccount,
    //   accounts: allAccounts,
    //   fiatPrice,
    //   network,
    // }));
    // const updatedCurrentAccount = await getCurrentAccount();
    // const updatedAllAccounts = await getAccounts();
    // if (
    //   currentAccount.history.confirmed[0] !==
    //   updatedCurrentAccount.history.confirmed[0]
    // )
    //   setState((s) => ({ ...s, account: null, accounts: null }));
    setState((s) => ({
      ...s,
      account: currentAccount,
      accounts: allAccounts,
      fiatPrice,
      network,
    }));
  };

  React.useEffect(() => {
    getData();
    checkTransactions();
    onAccountChange(() => getData());
  }, []);

  return (
    <>
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        flexDirection="column"
      >
        <Box
          height="52"
          roundedBottom="3xl"
          background={panelBg}
          shadow="md"
          width="full"
          position="relative"
        >
          <Box
            zIndex="2"
            position="absolute"
            top="6"
            left="6"
            width="14"
            height="14"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Image draggable={false} width="30px" src={Logo} />
          </Box>
          <Box zIndex="2" position="absolute" top="6" right="6">
            <Menu
              isOpen={menu}
              autoSelect={false}
              onClose={() => setMenu(false)}
            >
              <MenuButton
                onClick={() => setMenu(true)}
                position="relative"
                rounded="full"
                background={avatarBg}
                width="14"
                height="14"
                as={Button}
              >
                <Box position="absolute" top="5px" right="6px" width="76%">
                  <AvatarLoader avatar={avatar.avatar} />
                </Box>
              </MenuButton>
              <MenuList fontSize="xs">
                <MenuGroup title="Accounts">
                  <Scrollbars
                    style={{ width: '100%' }}
                    autoHeight
                    autoHeightMax={270}
                  >
                    {state.accounts &&
                      Object.keys(state.accounts).map((accountIndex) => {
                        const account = state.accounts[accountIndex];
                        return (
                          <MenuItem
                            position="relative"
                            key={accountIndex}
                            onClick={async () => {
                              if (state.account.index === account.index) return;
                              setMenu(false);
                              await switchAccount(accountIndex);
                            }}
                          >
                            <Stack direction="row" alignItems="center">
                              <Box boxSize="2rem" mr="12px">
                                <AvatarLoader avatar={account.avatar} />
                              </Box>

                              <Box display="flex" flexDirection="column">
                                <Box height="1.5" />
                                <Text
                                  mb="-1"
                                  fontWeight="bold"
                                  fontSize="14px"
                                  isTruncated={true}
                                  maxWidth="210px"
                                >
                                  {account.name}
                                </Text>
                                <Text>
                                  <UnitDisplay
                                    quantity={
                                      account[state.network.id].lovelace
                                    }
                                    decimals={6}
                                    symbol="₳"
                                  />
                                </Text>
                              </Box>
                              {state.account.index === account.index && (
                                <>
                                  <Box width="2" />
                                  <StarIcon />
                                </>
                              )}
                            </Stack>
                          </MenuItem>
                        );
                      })}
                  </Scrollbars>
                </MenuGroup>
                <MenuDivider />

                <MenuItem
                  icon={<AddIcon />}
                  onClick={() => newAccountRef.current.openModal()}
                >
                  {' '}
                  New Account
                </MenuItem>
                {state.account &&
                  state.accounts &&
                  state.account.index >=
                    Object.keys(state.accounts).length - 1 &&
                  Object.keys(state.accounts).length > 1 && (
                    <MenuItem
                      color="red.500"
                      icon={<DeleteIcon />}
                      onClick={() => deletAccountRef.current.openModal()}
                    >
                      {' '}
                      Delete Account
                    </MenuItem>
                  )}
                <MenuDivider />
                <MenuItem
                  onClick={() => history.push('/settings')}
                  icon={<SettingsIcon />}
                >
                  Settings
                </MenuItem>
                <MenuItem>Help</MenuItem>
              </MenuList>
            </Menu>
          </Box>
          <Box
            zIndex="1"
            position="absolute"
            width="full"
            top="8"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              color="white"
              fontSize="lg"
              isTruncated={true}
              maxWidth="210px"
            >
              {avatar.name}
            </Text>
          </Box>
          <Box
            position="absolute"
            width="full"
            height="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontSize="2xl" fontWeight="bold">
              {state.account ? (
                <UnitDisplay
                  quantity={state.account.lovelace}
                  decimals={6}
                  symbol="₳"
                />
              ) : (
                '... ₳'
              )}
            </Text>
          </Box>
          <Box
            style={{ bottom: 66 }}
            position="absolute"
            width="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontSize="md">
              <UnitDisplay
                fontSize="sm"
                quantity={
                  state.account &&
                  parseInt(
                    displayUnit(state.account.lovelace) *
                      state.fiatPrice *
                      10 ** 2
                  )
                }
                symbol="$"
                decimals={2}
              />
            </Text>
          </Box>

          <Box
            position="absolute"
            style={{ top: 186, right: 134 }}
            width="20"
            height="8"
          >
            <Popover matchWidth={true}>
              <LightMode>
                <PopoverTrigger>
                  <Button
                    rightIcon={<Icon as={BsArrowDownRight} />}
                    background="white"
                    color="orange.400"
                    rounded="xl"
                    size="sm"
                    shadow="md"
                  >
                    Receive
                  </Button>
                </PopoverTrigger>
              </LightMode>
              <PopoverContent width="60">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody
                  mt="6"
                  alignItems="center"
                  justifyContent="center"
                  display="flex"
                  flexDirection="column"
                  textAlign="center"
                >
                  {state.account && (
                    <>
                      <Box>
                        <QrCode value={state.account.paymentAddr} />
                      </Box>
                      <Box height="4" />
                      <Copy
                        label="Copied address"
                        copy={state.account.paymentAddr}
                      >
                        <Text
                          fontSize="xs"
                          lineHeight="1.2"
                          cursor="pointer"
                          wordBreak="break-all"
                        >
                          {state.account.paymentAddr} <CopyIcon />
                        </Text>
                      </Copy>
                      <Box height="2" />
                    </>
                  )}
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Box>

          <Box
            position="absolute"
            style={{ top: 186, right: 24 }}
            width="20"
            height="8"
          >
            <LightMode>
              <Button
                onClick={() => history.push('/send')}
                size="sm"
                rightIcon={<Icon as={BsArrowUpRight} />}
                colorScheme="orange"
                rounded="xl"
                shadow="md"
              >
                Send
              </Button>
            </LightMode>
          </Box>
        </Box>
        <Box height="8" />
        <Tabs
          width="full"
          alignItems="center"
          display="flex"
          flexDirection="column"
          variant="soft-rounded"
          colorScheme="teal"
        >
          <TabList>
            <Tab>Assets</Tab>
            <Tab>History</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <AssetsViewer assets={state.account && state.account.assets} />
            </TabPanel>
            <TabPanel>
              <HistoryViewer account={state.account} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <NewAccountModal ref={newAccountRef} />
      <DeleteAccountModal
        name={state.account && state.account.name}
        ref={deletAccountRef}
      />
    </>
  );
};

const NewAccountModal = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [state, setState] = React.useState({
    password: '',
    show: false,
    name: '',
  });

  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
  }));

  React.useEffect(() => {
    setState({
      password: '',
      show: false,
      name: '',
    });
  }, [isOpen]);

  return (
    <Modal size="xs" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">Create new account</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box display="flex" alignItems="center" justifyContent="center">
            <Icon as={BsFillPersonPlusFill} w={6} h={6} />
          </Box>
          <Spacer height="4" />
          <Input
            onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
            placeholder="Enter account name"
          />
          <Spacer height="4" />
          <InputGroup size="md">
            <Input
              variant="filled"
              isInvalid={state.wrongPassword === true}
              pr="4.5rem"
              type={state.show ? 'text' : 'password'}
              onChange={(e) =>
                setState((s) => ({ ...s, password: e.target.value }))
              }
              placeholder="Enter password"
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                onClick={() => setState((s) => ({ ...s, show: !s.show }))}
              >
                {state.show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
          {state.wrongPassword === true && (
            <Text color="red.300">Password is wrong</Text>
          )}
        </ModalBody>

        <ModalFooter>
          <Button mr={3} variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            isDisabled={!state.password || !state.name}
            colorScheme="teal"
            onClick={async () => {
              try {
                await createAccount(state.name, state.password);
                onClose();
              } catch (e) {
                setState((s) => ({ ...s, wrongPassword: true }));
              }
            }}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

const DeleteAccountModal = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
  }));

  return (
    <AlertDialog
      size="xs"
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="md" fontWeight="bold">
            Delete current account
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text fontSize="sm">
              Are you sure you want to delete <b>{props.name}</b>?
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={async () => {
                await deleteAccount();
                await switchAccount(0);
                onClose();
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
});

export default Wallet;
