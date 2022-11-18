import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState } from 'react';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
} from '@mui/material';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/admin';

import {
  leadNftAddress,
  leadNftAbi,
  leadTokenAddress,
  leadTokenAbi,
  crowdSaleAbi,
  crowdSaleAddress,
} from '../constants';

// ----------------------------------------------------------------------
const { ethers } = require('ethers');

const TABLE_HEAD = [
  { id: 'Tower', label: 'Tower', alignRight: false },
  { id: 'TokenId', label: 'TokenId', alignRight: false },
  { id: 'rewards', label: 'Rewards', alignRight: false },
  { id: 'isVerified', label: 'Minted', alignRight: false },
  { id: 'status', label: 'NFT Status', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.towerName.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Admin() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('towerName');

  const [filtertowerName, setFiltertowerName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.tokenId);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, towerName) => {
    const selectedIndex = selected.indexOf(towerName);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, towerName);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };
  const listenForTransactionMine = async (txResponse, provider) => {
    console.log('Mining with ');
    console.log(txResponse.hash);
    return new Promise((resolve, reject) => {
      provider.once(txResponse.hash, (txReceipt) => {
        console.log('Completed with confirmations');
        console.log(txReceipt.confirmations);
        resolve();
      });
    });
  };
  const mintNft = async (tokenId, tokenName) => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask Installed');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      console.log(account);
      const leadNft = new ethers.Contract(leadNftAddress, leadNftAbi, signer);
      console.log('LeadNft Address');
      console.log(leadNft.address);
      const leadToken = new ethers.Contract(leadTokenAddress, leadTokenAbi, signer);
      console.log('LeadToken Address');
      console.log(leadToken.address);
      try {
        console.log('Minting Token Id: ');
        console.log(tokenId);
        const txResponse = await leadNft.safeMint(leadToken.address, tokenId, tokenName);
        await listenForTransactionMine(txResponse, provider);
        console.log('Minted Token Id: ');
        console.log(tokenId);
      } catch (error) {
        console.log('Error');
        console.log(error);
      }
    }
  };
  const fractionalizeNft = async (tokenId) => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask Installed');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      console.log(account);
      const leadNft = new ethers.Contract(leadNftAddress, leadNftAbi, signer);
      const leadToken = new ethers.Contract(leadTokenAddress, leadTokenAbi, signer);
      console.log('LeadToken Address');
      console.log(leadToken.address);
      try {
        console.log('Fractionalizing Token Id: ');
        console.log(tokenId);
        const txResponse = await leadToken.fractionalize(leadNft.address, tokenId);
        await listenForTransactionMine(txResponse, provider);
        console.log('Fractionalized Token Id: ');
        console.log(tokenId);
      } catch (error) {
        console.log('Error');
        console.log(error);
      }
    }
  };

  const openCrowdSale = async () => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask Installed');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      const account1 = accounts[1];
      console.log(account);
      console.log(account1);
      const leadToken = new ethers.Contract(leadTokenAddress, leadTokenAbi, signer);
      const crowdSaleContract = new ethers.Contract(crowdSaleAddress, crowdSaleAbi, signer);
      console.log('Crowdsale Address');
      console.log(crowdSaleContract.address);
      try {
        console.log('Setting crowdsale as a minter.');
        let txResponse = await leadToken.setMinter(crowdSaleContract.address);
        await listenForTransactionMine(txResponse, provider);
        console.log('Openining sale, increasing time manually');
        txResponse = await provider.sendTransaction('evm_increaseTime', [3600]);
        await listenForTransactionMine(txResponse, provider);
        console.log('Time increased');
        txResponse = await provider.sendTransaction('evm_mine');
        await listenForTransactionMine(txResponse, provider);
        console.log('Sale open.');
      } catch (error) {
        console.log('Error');
        console.log(error);
      }
    }
  };

  const handleFractionalize = async (tokenId) => {
    console.log('Fractionalizing');
    const num = tokenId.match(/\d+/g);
    console.log(num[0]);
    await fractionalizeNft(num[0]);
  };
  const handleOpenSale = async (tokenId) => {
    console.log('Fractionalizing');
    const num = tokenId.match(/\d+/g);
    console.log(num[0]);
    await openCrowdSale();
  };
  const handleMint = async (tokenId, tokenName) => {
    console.log(tokenId);
    console.log(tokenName);
    const num = tokenId.match(/\d+/g);
    await mintNft(num[0], tokenName);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterBytowerName = (event) => {
    setPage(0);
    setFiltertowerName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filtertowerName);

  const isNotFound = !filteredUsers.length && !!filtertowerName;

  return (
    <>
      <Helmet>
        <title> User | Minimal UI </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Welcome Admin
          </Typography>
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filtertowerName={filtertowerName}
            onFiltertowerName={handleFilterBytowerName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={USERLIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, towerName, rewards, status, tokenId, avatarUrl, isVerified } = row;
                    const selectedTower = selected.indexOf(towerName) !== -1;
                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedTower}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedTower} onChange={(event) => handleClick(event, towerName)} />
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar alt={towerName} src={avatarUrl} />
                            <Typography variant="subtitle2" noWrap>
                              {towerName}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="left">{tokenId}</TableCell>

                        <TableCell align="left">{rewards ? 'Yes' : 'No'}</TableCell>

                        <TableCell align="left">
                          <Label color={(status === 'minted' && 'notminted') || 'success'}>
                            {sentenceCase(status === 'Fractionalized' ? 'minted' : 'not minted')}
                          </Label>
                        </TableCell>

                        <TableCell align="left">
                          <Label color={(status === 'banned' && 'error') || 'success'}>{sentenceCase(status)}</Label>
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            onClick={() => {
                              handleMint(tokenId, towerName);
                            }}
                            disabled={status === 'Fractionalized'}
                          >
                            Mint
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            onClick={() => {
                              handleFractionalize(tokenId);
                            }}
                            disabled={status === 'Fractionalized'}
                          >
                            Fractionalize
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            onClick={() => {
                              handleOpenSale(tokenId);
                            }}
                            disabled={status === 'Fractionalized'}
                          >
                            OpenSale
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filtertowerName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={USERLIST.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}
