import { useCallback, useEffect, useState } from "react";
import { Contract, formatEther, ethers, type Network, type BrowserProvider, type JsonRpcSigner } from "ethers";
import { Avatar, List, Divider, Input, Card, Tag, Spin, Button } from 'antd'
import { TokenAbi, NftAbi, TokenBankAbi, NftMarketAbi } from './abi'
import './App.css';
import tokenAbi from './abi/token.json'
import tokenBankAbiJSON from './abi/token-bank.json'
import { address as ContractAddress } from './utils/index'
import { TokenAddress } from "./utils/address";

function App() {
  const [provider, setProvider] = useState<BrowserProvider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<string>('');
  const [networkName, setNetworkName] = useState<string>();
  const [depositValue, setDepositValue] = useState<string>();
  const [myTokenBalalnce, setMyTokenBalance] = useState<string>("");
  const [myToken, setMyToken] = useState<string>("");
  const [logsArr, setLogsArr] = useState<Array<{hash: string, receipt: string}>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner();
        
        // 初始化provider和signer
        setProvider(provider);
        setSigner(signer);
  
        // 初始化network相关信息
        const network = provider.getNetwork()
        initNetwork(network)
      }
    }
    initProvider()
  }, [])

  const initNetwork = (network: Promise<Network>) => {
    network.then((res: Network)  => {
      setNetworkName(res.name)
    })
  }
  const handleConnect = async () => {
    try {
      if (!provider || !signer) {
        return
      }

      const address = await signer.getAddress()
      const balance = await provider.getBalance(address)
      const bal = formatEther(balance)
      
      setAddress(address)
      setBalance(bal.slice(0, 6))
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    if (!signer || !address) return;
    const initToken = async () => {
      const contract = new Contract(ContractAddress.TokenAddress, tokenAbi, signer);
      const token = await contract.symbol();
      setMyToken(token)
    }
    initToken()
  }, [address, signer])

  const getBankContract = useCallback(() => {
    return new Contract(ContractAddress.TokenBankAddress, tokenBankAbiJSON, signer)
   }, [signer])
  
   //  init bank
  const getBankInfo = useCallback(async () => {
    if (!signer || !address) return;
    const tokenBalance = await getBankContract().balances(address)
    setMyTokenBalance(tokenBalance.toString())
  }, [getBankContract, address, signer])

  useEffect(() => {
    getBankInfo()
  }, [getBankInfo])
  
  const handleDeposit = async () => {
    try {
      setLoading(true)
      const bankContract = getBankContract()
      const result = await bankContract.deposit(depositValue)
      printTx(result)
    } catch (error) {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    try {
      setLoading(true)
      const bankContract = getBankContract()
      const result = await bankContract.withdraw()
      printTx(result)
    } catch (error) {
      setLoading(false)
    }
  }

  const printTx = async(result) => {
    const receipt = await result.wait()
    const obj = {
      hash: result.hash,
      receipt: JSON.stringify(receipt)
    }
    setLoading(false)
    getBankInfo()
    setLogsArr([...logsArr, obj])
  }

  if (!address) {
    return <div className="unconnected-box">
      <Button type="primary" onClick={handleConnect}>Connect Wallet</Button>
    </div>
  }

  return (
    <Spin spinning={loading}>
      <div className="container">
        <div className="box">
          <Card title={`My Account：${address}`} style={{ margin: '0 auto', width: 600 }}>
            <div className="box-item">
              <span className="label">ETH Balance：</span>
              <Tag color="#2db7f5" className="value">{balance} eth</Tag>
            </div>
            <div className="box-item">
              <span className="label">NetWork：</span>
              <Tag color="#87d068" className="value">{networkName}</Tag>
            </div>
          </Card>
          <Card title="Token Bank" style={{ margin: '20px auto', width: 600 }}>
            <div className="bank-item">
            <span className="label">Token Name：</span>
            <Tag color="#2db7f5"  className="value">{myToken}</Tag>
            </div>
            <div className="bank-item">
              <span className="label">Banlance：</span>
              {
                myTokenBalalnce &&
                <Tag color="#87d068" className="value">{myTokenBalalnce}</Tag>
              }
            </div>
            <Divider></Divider>
            <div className="bank-item">
              <Input 
                onChange={(e) => {
                  setDepositValue(e.target.value)
                }}
                style={{width: '240px', marginRight: "12px"}} 
                placeholder="Please Input Amount!" />
              <Button onClick={handleDeposit} type="primary" style={{marginRight: '24px'}}>Deposit</Button>
              <Button onClick={handleWithdraw} type="primary">Withdraw</Button>
            </div>

          </Card>
        </div>
        <div className="logs-box">
          <List
            header={<h4>Transation Logs</h4>}
            itemLayout="horizontal"
            dataSource={logsArr}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                  title={<span style={{'color': 'red'}}>{item.hash}</span>}
                  description={item.receipt}
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    </Spin>
  );
}

export default App;