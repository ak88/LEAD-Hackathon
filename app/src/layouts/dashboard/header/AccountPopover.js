import { useEffect, useState } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Button, Divider, Typography, Stack, MenuItem, Avatar, IconButton, Popover } from '@mui/material';
// mocks_
import account from '../../../_mock/account';

export default function AccountPopover() {
  const [open, setOpen] = useState(null);
  const [buttonText, setButtonText] = useState('Connect to wallet');
  // useEffect(() => {
  //   connect();
  // }, [setButtonText]);

  const connect = async () => {
    if (!(await isMetaMaskInstalled())) {
      setButtonText('Please install meta meask plugin');
    }
  };

  const isMetaMaskInstalled = async () => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('Metamask found.');
      await window.ethereum.enable();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      console.log(account);
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log(accounts[0]);
      });
      setButtonText('Connected');
      console.log('Connected');
      return true;
    }
    return false;
  };

  return (
    <>
      <Box sx={{ px: -5, pb: 3, mt: 0 }}>
        <Stack alignItems="center" spacing={3} sx={{ pt: 5, borderRadius: 2, position: 'relative' }}>
          <Box
            component="img"
            src="/assets/illustrations/MetaMask_Fox.svg.png"
            sx={{ width: 30, position: 'absolute', top: 30 }}
          />

          <Button
            onClick={() => {
              connect();
            }}
            variant="contained"
          >
            {buttonText}
          </Button>
        </Stack>
      </Box>
    </>
  );
}
