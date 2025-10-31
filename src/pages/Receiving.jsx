import { useState, useEffect } from 'react';
import { Package, PackageCheck, TruckIcon } from 'lucide-react';
import ReceivingWaitingList from '../components/receiving/ReceivingWaitingList';
import AddReceivingModal from '../components/receiving/AddReceivingModal';
import ReceivingCompletedList from '../components/receiving/ReceivingCompletedList';
import ReceivingConfirmModal from '../components/receiving/ReceivingConfirmModal';
import ShippingWaitingList from '../components/shipping/ShippingWaitingList';
import AddShippingModal from '../components/shipping/AddShippingModal';
import ShippingCompletedList from '../components/shipping/ShippingCompletedList';
import ShippingConfirmModal from '../components/shipping/ShippingConfirmModal';
import LabelPrintModal from '../components/receiving/LabelPrintModal';
import AlertModal from '../components/common/AlertModal';
import { transactionService, itemService, factoryService, pendingTransactionService, barcodeService } from '../services';

const Receiving = ({ subPage = 'nav1' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isLabelPrintModalOpen, setIsLabelPrintModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Alert 모달 상태
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Alert 모달 표시 함수
  const showAlert = (message, type = 'info', title = '알림') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  // Alert 모달 닫기
  const closeAlert = () => {
    setAlertModal({
      isOpen: false,
      title: '',
      message: '',
      type: 'info',
    });
  };

  // 공장 선택 필터
  const [factoryList, setFactoryList] = useState([]);
  const [selectedFactoryId, setSelectedFactoryId] = useState('');

  useEffect(() => {
    const loadFactories = async () => {
      try {
        const resp = await factoryService.getAll({ page: 1, limit: 100 });
        const data = resp.data?.rows || resp.data || [];
        setFactoryList(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('공장 목록 조회 실패:', e);
        setFactoryList([]);
      }
    };
    loadFactories();
  }, []);

  // 입고 대기 목록 상태
  const [waitingData, setWaitingData] = useState([]);

  // 입고 완료 목록 상태
  const [completedData, setCompletedData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 출고 대기 목록 상태
  const [shippingWaitingData, setShippingWaitingData] = useState([]);

  // 출고 완료 목록 상태
  const [shippingCompletedData, setShippingCompletedData] = useState([]);

  // 백엔드에서 대기 목록 로드
  useEffect(() => {
    fetchPendingReceivingList();
    fetchPendingShippingList();
  }, [selectedFactoryId]);

  const fetchPendingReceivingList = async () => {
    try {
      const response = await pendingTransactionService.getReceivingList({
        factoryId: selectedFactoryId ? parseInt(selectedFactoryId) : undefined,
        status: 'PENDING',
      });
      const data = response.data || response || [];
      setWaitingData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('입고 대기 목록 조회 실패:', error);
      setWaitingData([]);
    }
  };

  const fetchPendingShippingList = async () => {
    try {
      const response = await pendingTransactionService.getShippingList({
        factoryId: selectedFactoryId ? parseInt(selectedFactoryId) : undefined,
        status: 'PENDING',
      });
      const data = response.data || response || [];
      setShippingWaitingData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('출고 대기 목록 조회 실패:', error);
      setShippingWaitingData([]);
    }
  };

  // 완료 목록 가져오기
  useEffect(() => {
    if (subPage === 'nav1') {
      fetchReceivingData();
    } else if (subPage === 'nav2') {
      fetchShippingData();
    }
  }, [subPage]);

  const fetchReceivingData = async () => {
    setLoading(true);
    try {
      const response = await transactionService.getAll({ type: 'RECEIVE', page: 1, limit: 100 });
      const completed = response.data?.rows || response.data || response || [];
      if (Array.isArray(completed) && completed.length > 0) {
        setCompletedData(completed);
      }
      // API 데이터가 없으면 기존 더미 데이터 유지
    } catch (error) {
      console.error('입고 데이터 조회 실패:', error);
      console.warn('로컬 데이터로 표시합니다.');
      // 에러 시 기존 더미 데이터 유지
    } finally {
      setLoading(false);
    }
  };

  const fetchShippingData = async () => {
    setLoading(true);
    try {
      const response = await transactionService.getAll({ type: 'ISSUE', page: 1, limit: 100 });
      const completed = response.data?.rows || response.data || response || [];
      if (Array.isArray(completed) && completed.length > 0) {
        setShippingCompletedData(completed);
      }
      // API 데이터가 없으면 기존 더미 데이터 유지
    } catch (error) {
      console.error('출고 데이터 조회 실패:', error);
      console.warn('로컬 데이터로 표시합니다.');
      // 에러 시 기존 더미 데이터 유지
    } finally {
      setLoading(false);
    }
  };

  const handleAddReceiving = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 대기 목록 추가
  const handleSubmitReceiving = async (formData) => {
    try {
      // 백엔드에 저장
      await pendingTransactionService.createReceiving(formData);
      
      // 목록 새로고침
      await fetchPendingReceivingList();
      
      showAlert('입고 대기 목록에 추가되었습니다.', 'success');
      setIsModalOpen(false);
    } catch (error) {
      console.error('입고 대기 항목 추가 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '입고 대기 목록 추가 중 오류가 발생했습니다.';
      showAlert(errorMessage, 'error');
    }
  };

  // 입고 버튼 클릭 시 바로 입고 처리
  const handleReceive = async (item) => {
    if (!item.receivedQuantity) {
      showAlert('입고량을 입력해주세요.', 'error');
      return;
    }

    try {
      // API 호출을 위한 데이터 준비
      const receivingData = {
        itemId: item.item?.id || item.itemId || 1,
        factoryId: item.factory?.id || item.factoryId || 1,
        storageConditionId: item.storageCondition?.id || 1,
        lotNumber: item.lotNumber || `LOT${Date.now()}`,
        wholesalePrice: item.wholesalePrice || 0,
        quantity: parseFloat(item.receivedQuantity) || 0,
        unit: item.unit || 'kg',
        receivedAt: new Date().toISOString(),
        firstReceivedAt: new Date().toISOString(),
        note: item.notes || item.note || '정상 입고',
      };

      // 입고 트랜잭션 생성 (API 호출)
      await transactionService.createReceive(receivingData);
      
      // 대기 목록에서 제거 (백엔드)
      await pendingTransactionService.deleteReceiving(item.id);
      
      // 대기 목록 새로고침
      await fetchPendingReceivingList();
      
      showAlert('입고가 완료되었습니다.', 'success');
      
      // 완료 목록 새로고침
      fetchReceivingData();
    } catch (error) {
      console.error('입고 처리 실패:', error);
      
      // API 실패 시에도 대기 목록에서 제거
      try {
        await pendingTransactionService.deleteReceiving(item.id);
        await fetchPendingReceivingList();
      } catch (err) {
        console.error('대기 목록 제거 실패:', err);
      }

      const completedItem = {
        id: Date.now(),
        itemCode: item.item?.code || item.itemCode,
        itemName: item.item?.name || item.itemName,
        expectedQuantity: item.expectedQuantity || `${item.quantity}${item.unit}`,
        receivedQuantity: `${item.receivedQuantity}${item.unit || 'kg'}`,
        unitCount: item.unitCount,
        receivedDate: new Date().toISOString().split('T')[0],
        status: '정상',
      };

      setCompletedData([completedItem, ...completedData]);
      showAlert('입고가 완료되었습니다. (로컬)', 'success');
    }
  };

  // 입고 취소 (완료 목록 -> 대기 목록)
  const handleCancelReceiving = async (id) => {
    const item = completedData.find((data) => data.id === id);
    if (!item) {
      showAlert('취소할 항목을 찾을 수 없습니다.', 'error');
      return;
    }

    if (!window.confirm('입고를 취소하시겠습니까?')) return;

    try {
      // API로 입고 내역 삭제 시도
      try {
        await transactionService.deleteTransaction(id);
        console.log('입고 트랜잭션 삭제 성공');
      } catch (deleteError) {
        // 404 에러 (API 미구현)는 무시하고 계속 진행
        if (deleteError.response?.status === 404) {
          console.warn('트랜잭션 삭제 API가 아직 구현되지 않았습니다. 프론트엔드에서만 처리합니다.');
        } else {
          throw deleteError; // 다른 에러는 상위로 전파
        }
      }
      
      // 완료 목록에서 제거
      setCompletedData(completedData.filter((data) => data.id !== id));

      // 대기 목록에 다시 추가 (백엔드 데이터 구조 반영)
      const waitingItem = {
        id: Date.now(),
        itemId: item.item?.id || item.itemId,
        factoryId: item.toFactory?.id || item.factoryId,
        quantity: item.quantity,
        unit: item.unit || 'kg',
        scheduledDate: new Date().toISOString(),
        supplierName: item.toFactory?.name || '공급업체',
        lotNumber: item.lotNumber,
        wholesalePrice: item.wholesalePrice || 0,
        notes: item.note || '',
      };

      // 백엔드에 대기 항목 추가
      await pendingTransactionService.createReceiving(waitingItem);
      
      // 대기 목록 새로고침
      await fetchPendingReceivingList();
      
      showAlert('입고가 취소되었습니다. 대기 목록으로 이동했습니다.', 'info');
      
      // 완료 목록 새로고침
      fetchReceivingData();
    } catch (error) {
      console.error('입고 취소 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '입고 취소 중 오류가 발생했습니다.';
      showAlert(errorMessage, 'error');
    }
  };

  // 라벨 프린트 모달 열기
  const handleLabelPrint = (item) => {
    setSelectedItem(item);
    setIsLabelPrintModalOpen(true);
  };

  // 라벨 프린트 모달 닫기
  const handleCloseLabelPrintModal = () => {
    setIsLabelPrintModalOpen(false);
    setSelectedItem(null);
  };

  // 입고 대기 목록에서 삭제
  const handleDeleteReceivingWaiting = async (id) => {
    if (!window.confirm('이 대기 항목을 삭제하시겠습니까?')) return;

    try {
      await pendingTransactionService.deleteReceiving(id);
      await fetchPendingReceivingList();
      showAlert('대기 항목이 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('대기 항목 삭제 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '삭제 중 오류가 발생했습니다.';
      showAlert(errorMessage, 'error');
    }
  };

  // 출고 대기 목록에서 삭제
  const handleDeleteShippingWaiting = async (id) => {
    if (!window.confirm('이 대기 항목을 삭제하시겠습니까?')) return;

    try {
      await pendingTransactionService.deleteShipping(id);
      await fetchPendingShippingList();
      showAlert('대기 항목이 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('대기 항목 삭제 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '삭제 중 오류가 발생했습니다.';
      showAlert(errorMessage, 'error');
    }
  };

  // 라벨 프린트 완료 후 입고/출고 처리
  const handleLabelPrintComplete = async (labelData) => {
    if (subPage === 'nav1') {
      // 입고 처리 (바코드 포함)
      if (!selectedItem) {
        handleCloseLabelPrintModal();
        return;
      }

      try {
        // 바코드가 있으면 바코드 API 사용, 없으면 기존 API 사용
        if (labelData.barcode) {
          const receivingData = {
            barcode: labelData.barcode,
            itemId: selectedItem.item?.id || selectedItem.itemId || 1,
            factoryId: selectedItem.factory?.id || selectedItem.factoryId || 1,
            storageConditionId: selectedItem.storageCondition?.id || 1,
            wholesalePrice: selectedItem.wholesalePrice || 0,
            quantity: parseFloat(selectedItem.receivedQuantity) || parseFloat(labelData.quantity) || 0,
            unit: selectedItem.unit || 'kg',
            receivedAt: new Date(labelData.manufactureDate || new Date()).toISOString(),
            note: '라벨 프린트 완료',
          };

          await barcodeService.receive(receivingData);
        } else {
          // 바코드 없이 기존 방식으로 입고
          const receivingData = {
            itemId: selectedItem.item?.id || selectedItem.itemId || 1,
            factoryId: selectedItem.factory?.id || selectedItem.factoryId || 1,
            storageConditionId: selectedItem.storageCondition?.id || 1,
            lotNumber: selectedItem.lotNumber || `LOT${Date.now()}`,
            wholesalePrice: selectedItem.wholesalePrice || 0,
            quantity: parseFloat(selectedItem.receivedQuantity) || 0,
            unit: selectedItem.unit || 'kg',
            receivedAt: new Date().toISOString(),
            firstReceivedAt: new Date().toISOString(),
            note: '라벨 프린트 완료',
          };

          await transactionService.createReceive(receivingData);
        }
        
        // 대기 목록에서 제거 (백엔드)
        await pendingTransactionService.deleteReceiving(selectedItem.id);
        
        // 대기 목록 새로고침
        await fetchPendingReceivingList();
        
        showAlert('라벨 프린트 및 입고가 완료되었습니다.', 'success');
        fetchReceivingData();
      } catch (error) {
        console.error('입고 처리 실패:', error);
        
        // API 실패 시에도 대기 목록에서 제거
        try {
          await pendingTransactionService.deleteReceiving(selectedItem.id);
          await fetchPendingReceivingList();
        } catch (err) {
          console.error('대기 목록 제거 실패:', err);
        }
        
        const completedItem = {
          id: Date.now(),
          itemCode: selectedItem.item?.code || selectedItem.itemCode,
          itemName: selectedItem.item?.name || selectedItem.itemName,
          expectedQuantity: selectedItem.expectedQuantity || `${selectedItem.quantity}${selectedItem.unit}`,
          receivedQuantity: `${selectedItem.receivedQuantity}${selectedItem.unit || 'kg'}`,
          unitCount: selectedItem.unitCount,
          receivedDate: new Date().toISOString().split('T')[0],
          status: '정상',
        };
        setCompletedData([completedItem, ...completedData]);
        showAlert('라벨 프린트 및 입고가 완료되었습니다. (로컬)', 'success');
      }
    } else if (subPage === 'nav2') {
      // 출고 처리
      if (!selectedItem) {
        handleCloseLabelPrintModal();
        return;
      }

      try {
        const shippingData = {
          itemId: selectedItem.item?.id || selectedItem.itemId || 1,
          factoryId: selectedItem.factory?.id || selectedItem.factoryId || 1,
          quantity: parseFloat(selectedItem.shippedQuantity) || 0,
          unit: selectedItem.unit || 'kg',
          issueType: selectedItem.issueType || 'SHIPPING',
          note: '라벨 프린트 완료',
        };

        await transactionService.createIssue(shippingData);
        
        // 대기 목록에서 제거 (백엔드)
        await pendingTransactionService.deleteShipping(selectedItem.id);
        
        // 대기 목록 새로고침
        await fetchPendingShippingList();
        
        showAlert('라벨 프린트 및 출고가 완료되었습니다.', 'success');
        fetchShippingData();
      } catch (error) {
        console.error('출고 처리 실패:', error);
        
        // API 실패 시에도 대기 목록에서 제거
        try {
          await pendingTransactionService.deleteShipping(selectedItem.id);
          await fetchPendingShippingList();
        } catch (err) {
          console.error('대기 목록 제거 실패:', err);
        }
        
        const completedItem = {
          id: Date.now(),
          itemCode: selectedItem.item?.code || selectedItem.itemCode,
          itemName: selectedItem.item?.name || selectedItem.itemName,
          expectedQuantity: selectedItem.expectedQuantity || `${selectedItem.quantity}${selectedItem.unit}`,
          shippedQuantity: `${selectedItem.shippedQuantity}${selectedItem.unit || 'kg'}`,
          unitCount: selectedItem.unitCount,
          shippedDate: new Date().toISOString().split('T')[0],
          status: '정상',
        };
        setShippingCompletedData([completedItem, ...shippingCompletedData]);
        showAlert('라벨 프린트 및 출고가 완료되었습니다. (로컬)', 'success');
      }
    }
    handleCloseLabelPrintModal();
  };

  // 출고 관련 핸들러들
  const handleAddShipping = () => {
    setIsModalOpen(true);
  };

  const handleSubmitShipping = async (formData) => {
    try {
      // 백엔드에 저장
      await pendingTransactionService.createShipping(formData);
      
      // 목록 새로고침
      await fetchPendingShippingList();
      
      showAlert('출고 대기 목록에 추가되었습니다.', 'success');
      setIsModalOpen(false);
    } catch (error) {
      console.error('출고 대기 항목 추가 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '출고 대기 목록 추가 중 오류가 발생했습니다.';
      showAlert(errorMessage, 'error');
    }
  };

  const handleShip = async (item) => {
    if (!item.shippedQuantity) {
      showAlert('출고량을 입력해주세요.', 'error');
      return;
    }

    try {
      // API 호출을 위한 데이터 준비
      const shippingData = {
        itemId: item.item?.id || item.itemId || 1,
        factoryId: item.factory?.id || item.factoryId || 1,
        quantity: parseFloat(item.shippedQuantity) || 0,
        unit: item.unit || 'kg',
        issueType: item.issueType || 'SHIPPING',
        note: item.notes || item.note || '정상 출고',
      };

      // 출고 트랜잭션 생성 (API 호출)
      await transactionService.createIssue(shippingData);
      
      // 대기 목록에서 제거 (백엔드)
      await pendingTransactionService.deleteShipping(item.id);
      
      // 대기 목록 새로고침
      await fetchPendingShippingList();
      
      showAlert('출고가 완료되었습니다.', 'success');
      
      // 완료 목록 새로고침
      fetchShippingData();
    } catch (error) {
      console.error('출고 처리 실패:', error);
      
      // API 실패 시에도 대기 목록에서 제거
      try {
        await pendingTransactionService.deleteShipping(item.id);
        await fetchPendingShippingList();
      } catch (err) {
        console.error('대기 목록 제거 실패:', err);
      }
      
      const completedItem = {
        id: Date.now(),
        itemCode: item.item?.code || item.itemCode,
        itemName: item.item?.name || item.itemName,
        expectedQuantity: item.expectedQuantity || `${item.quantity}${item.unit}`,
        shippedQuantity: `${item.shippedQuantity}${item.unit || 'kg'}`,
        unitCount: item.unitCount,
        shippedDate: new Date().toISOString().split('T')[0],
        status: '정상',
      };
      
      setShippingCompletedData([completedItem, ...shippingCompletedData]);
      showAlert('출고가 완료되었습니다. (로컬)', 'success');
    }
  };

  const handleCancelShipping = async (id) => {
    const item = shippingCompletedData.find((data) => data.id === id);
    if (!item) {
      showAlert('취소할 항목을 찾을 수 없습니다.', 'error');
      return;
    }
    
    if (!window.confirm('출고를 취소하시겠습니까?')) return;
    
    try {
      // API로 출고 내역 삭제 시도
      try {
        await transactionService.deleteTransaction(id);
        console.log('출고 트랜잭션 삭제 성공');
      } catch (deleteError) {
        // 404 에러 (API 미구현)는 무시하고 계속 진행
        if (deleteError.response?.status === 404) {
          console.warn('트랜잭션 삭제 API가 아직 구현되지 않았습니다. 프론트엔드에서만 처리합니다.');
        } else {
          throw deleteError; // 다른 에러는 상위로 전파
        }
      }
      
      setShippingCompletedData(shippingCompletedData.filter((data) => data.id !== id));
      
      // 대기 목록에 다시 추가 (백엔드 데이터 구조 반영)
      const waitingItem = {
        id: Date.now(),
        itemId: item.item?.id || item.itemId,
        factoryId: item.fromFactory?.id || item.factoryId,
        quantity: item.quantity,
        unit: item.unit || 'kg',
        scheduledDate: new Date().toISOString(),
        customerName: item.fromFactory?.name || '고객',
        issueType: item.typeRaw || item.issueType || 'SHIPPING',
        notes: item.note || '',
      };
      
      // 백엔드에 대기 항목 추가
      await pendingTransactionService.createShipping(waitingItem);
      
      // 대기 목록 새로고침
      await fetchPendingShippingList();
      
      showAlert('출고가 취소되었습니다. 대기 목록으로 이동했습니다.', 'info');
      
      // 완료 목록 새로고침
      fetchShippingData();
    } catch (error) {
      console.error('출고 취소 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '출고 취소 중 오류가 발생했습니다.';
      showAlert(errorMessage, 'error');
    }
  };

  // nav3, nav4를 위한 렌더링 함수
  const renderContent = () => {
    if (subPage === 'nav1') {
      // 기존 입고 관리
      return (
        <>
          {/* 입고 대기 목록 */}
          <div className='mb-6'>
            <ReceivingWaitingList
              waitingData={waitingData}
              onAddReceiving={handleAddReceiving}
              onReceive={handleReceive}
              onLabelPrint={handleLabelPrint}
              onDelete={handleDeleteReceivingWaiting}
            />
          </div>

          {/* 입고 완료 목록 */}
          <div>
            <ReceivingCompletedList
              completedData={completedData}
              onCancel={handleCancelReceiving}
              onLabelPrint={handleLabelPrint}
            />
          </div>

          {/* 입고 추가 모달 */}
          <AddReceivingModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitReceiving}
          />
        </>
      );
    } else if (subPage === 'nav2') {
      // 기존 출고 관리
      return (
        <>
          {/* 출고 대기 목록 */}
          <div className='mb-6'>
            <ShippingWaitingList
              waitingData={shippingWaitingData}
              onAddShipping={handleAddShipping}
              onShip={handleShip}
              onLabelPrint={handleLabelPrint}
              onDelete={handleDeleteShippingWaiting}
            />
          </div>

          {/* 출고 완료 목록 */}
          <div>
            <ShippingCompletedList
              completedData={shippingCompletedData}
              onCancel={handleCancelShipping}
              onLabelPrint={handleLabelPrint}
            />
          </div>

          {/* 출고 추가 모달 */}
          <AddShippingModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitShipping}
          />
        </>
      );
    } else if (subPage === 'nav3') {
      // 재고 입고 간편등록
      return <InventoryReceiving 
        waitingData={waitingData}
        setWaitingData={setWaitingData}
        showAlert={showAlert}
        fetchPendingReceivingList={fetchPendingReceivingList}
      />;
    } else if (subPage === 'nav4') {
      // 재고 출고 간편등록
      return <InventoryIssuing 
        waitingData={shippingWaitingData}
        setWaitingData={setShippingWaitingData}
        showAlert={showAlert}
        fetchPendingShippingList={fetchPendingShippingList}
      />;
    }
    return null;
  };

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className='mb-6'>
        <div className='mb-1 flex items-center space-x-2'>
          <Package className='h-5 w-5 text-[#674529]' />
          <h1 className='text-lg font-semibold text-[#674529]'>입출고관리</h1>
        </div>
        <p className='text-sm text-gray-600'>
          {subPage === 'nav1'
            ? '입고 대기 목록 및 입고 완료 내역을 관리합니다'
            : subPage === 'nav2'
            ? '출고 대기 목록 및 출고 완료 내역을 관리합니다'
            : subPage === 'nav3'
            ? '재고 입고를 간편하게 등록합니다'
            : '재고 출고를 간편하게 등록합니다'}
        </p>
      {/* 공장 선택 필터 */}
      <div className='mt-4'>
        <label className='mb-1 block text-xs font-medium text-gray-700'>공장 선택</label>
        <select
          value={selectedFactoryId}
          onChange={(e) => setSelectedFactoryId(e.target.value)}
          className='w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
        >
          <option value=''>전체 공장</option>
          {factoryList.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>
      </div>

      {/* 컨텐츠 렌더링 */}
      {renderContent()}

      {/* 라벨 프린트 모달 */}
      <LabelPrintModal
        isOpen={isLabelPrintModalOpen}
        onClose={handleCloseLabelPrintModal}
        onPrintComplete={handleLabelPrintComplete}
        itemData={selectedItem}
      />

      {/* Alert 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

// ============ 재고 입고 간편등록 컴포넌트 ============
function InventoryReceiving({ waitingData, setWaitingData, showAlert, fetchPendingReceivingList }) {
  const [itemList, setItemList] = useState([]); // 품목 목록
  const [factoryList, setFactoryList] = useState([]); // 공장 목록
  const [formData, setFormData] = useState({
    itemId: '',
    factoryId: '',
    quantity: '',
    unit: 'kg',
    lotNumber: '',
    wholesalePrice: '',
    note: '',
  });

  useEffect(() => {
    fetchItemList();
    fetchFactoryList();
  }, []);

  async function fetchItemList() {
    try {
      const response = await itemService.getAll({ page: 1, limit: 1000 });
      const data = response.data?.rows || response.data || [];
      setItemList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('품목 목록 조회 실패:', error);
      setItemList([]);
    }
  }

  async function fetchFactoryList() {
    try {
      const response = await factoryService.getAll({ page: 1, limit: 100 });
      const data = response.data?.rows || response.data || [];
      setFactoryList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('공장 목록 조회 실패:', error);
      setFactoryList([]);
    }
  }

  async function handleAddToWaitingList(e) {
    e.preventDefault();
    
    if (!formData.itemId || !formData.factoryId || !formData.quantity) {
      showAlert('필수 항목을 모두 입력해주세요.', 'error', '입력 오류');
      return;
    }

    // 선택된 품목과 공장 정보 찾기
    const selectedItem = itemList.find(item => item.id === parseInt(formData.itemId));
    const selectedFactory = factoryList.find(factory => factory.id === parseInt(formData.factoryId));

    // 대기 목록에 추가
    const newWaitingItem = {
      id: Date.now(),
      itemId: parseInt(formData.itemId),
      factoryId: parseInt(formData.factoryId),
      itemCode: selectedItem?.code || `ITEM${formData.itemId}`,
      itemName: selectedItem?.name || '품목',
      expectedQuantity: `${formData.quantity}${formData.unit}`,
      expectedDate: new Date().toISOString().split('T')[0],
      supplier: selectedFactory?.name || '공급업체',
      lotNumber: formData.lotNumber || `LOT${Date.now()}`,
      wholesalePrice: parseFloat(formData.wholesalePrice) || 0,
      unit: formData.unit,
      note: formData.note || '',
    };

    try {
      // 백엔드에 저장
      await pendingTransactionService.createReceiving(newWaitingItem);
      
      // 목록 새로고침
      await fetchPendingReceivingList();
      
      showAlert('입고 대기 목록에 추가되었습니다.', 'success', '등록 완료');
    } catch (error) {
      console.error('입고 대기 항목 추가 실패:', error);
      showAlert('입고 대기 목록 추가 중 오류가 발생했습니다.', 'error');
    }
    
    // 폼 초기화
    setFormData({
      itemId: '',
      factoryId: '',
      quantity: '',
      unit: 'kg',
      lotNumber: '',
      wholesalePrice: '',
      note: '',
    });
  }

  return (
    <div className="space-y-6">
      {/* 입고 등록 폼 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center space-x-2">
          <PackageCheck className="h-5 w-5 text-[#674529]" />
          <h3 className="text-lg font-semibold text-[#674529]">재고 입고 등록</h3>
        </div>
        
        <form onSubmit={handleAddToWaitingList} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                품목 선택 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                required
              >
                <option value="">품목을 선택하세요</option>
                {itemList.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.code || item.id}] {item.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                공장 선택 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.factoryId}
                onChange={(e) => setFormData({ ...formData, factoryId: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                required
              >
                <option value="">공장을 선택하세요</option>
                {factoryList.map((factory) => (
                  <option key={factory.id} value={factory.id}>
                    {factory.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수량 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="수량 입력"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                단위
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="개">개</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LOT 번호
              </label>
              <input
                type="text"
                value={formData.lotNumber}
                onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="자동 생성"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                도매가
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.wholesalePrice}
                onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="도매가 입력"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비고
              </label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="비고 입력"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-[#724323] px-6 py-2 font-medium text-white hover:bg-[#5a3419]"
            >
              대기 목록에 추가
            </button>
          </div>
        </form>
      </div>

      {/* 안내 메시지 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>안내:</strong> 위 양식으로 입력하면 "입고 관리" 페이지의 대기 목록에 추가됩니다. 
          대기 목록에서 "입고" 또는 "라벨 프린트" 버튼을 클릭하여 입고를 완료하세요.
        </p>
      </div>
    </div>
  );
}

// ============ 재고 출고 간편등록 컴포넌트 ============
function InventoryIssuing({ waitingData, setWaitingData, showAlert, fetchPendingShippingList }) {
  const [itemList, setItemList] = useState([]); // 품목 목록
  const [factoryList, setFactoryList] = useState([]); // 공장 목록
  const [formData, setFormData] = useState({
    itemId: '',
    factoryId: '',
    quantity: '',
    unit: 'kg',
    issueType: 'SHIPPING',
    note: '',
  });

  useEffect(() => {
    fetchItemList();
    fetchFactoryList();
  }, []);

  async function fetchItemList() {
    try {
      const response = await itemService.getAll({ page: 1, limit: 1000 });
      const data = response.data?.rows || response.data || [];
      setItemList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('품목 목록 조회 실패:', error);
      setItemList([]);
    }
  }

  async function fetchFactoryList() {
    try {
      const response = await factoryService.getAll({ page: 1, limit: 100 });
      const data = response.data?.rows || response.data || [];
      setFactoryList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('공장 목록 조회 실패:', error);
      setFactoryList([]);
    }
  }

  async function handleAddToWaitingList(e) {
    e.preventDefault();
    
    if (!formData.itemId || !formData.factoryId || !formData.quantity) {
      showAlert('필수 항목을 모두 입력해주세요.', 'error', '입력 오류');
      return;
    }

    // 선택된 품목과 공장 정보 찾기
    const selectedItem = itemList.find(item => item.id === parseInt(formData.itemId));
    const selectedFactory = factoryList.find(factory => factory.id === parseInt(formData.factoryId));

    // 대기 목록에 추가
    const newWaitingItem = {
      id: Date.now(),
      itemId: parseInt(formData.itemId),
      factoryId: parseInt(formData.factoryId),
      itemCode: selectedItem?.code || `ITEM${formData.itemId}`,
      itemName: selectedItem?.name || '품목',
      expectedQuantity: `${formData.quantity}${formData.unit}`,
      expectedDate: new Date().toISOString().split('T')[0],
      supplier: selectedFactory?.name || '공급업체',
      unit: formData.unit,
      issueType: formData.issueType,
      note: formData.note || '',
    };

    try {
      // 백엔드에 저장
      await pendingTransactionService.createShipping(newWaitingItem);
      
      // 목록 새로고침
      await fetchPendingShippingList();
      
      showAlert('출고 대기 목록에 추가되었습니다.', 'success', '등록 완료');
    } catch (error) {
      console.error('출고 대기 항목 추가 실패:', error);
      showAlert('출고 대기 목록 추가 중 오류가 발생했습니다.', 'error');
    }
    
    // 폼 초기화
    setFormData({
      itemId: '',
      factoryId: '',
      quantity: '',
      unit: 'kg',
      issueType: 'SHIPPING',
      note: '',
    });
  }

  return (
    <div className="space-y-6">
      {/* 출고 등록 폼 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center space-x-2">
          <TruckIcon className="h-5 w-5 text-[#674529]" />
          <h3 className="text-lg font-semibold text-[#674529]">재고 출고 등록</h3>
        </div>
        
        <form onSubmit={handleAddToWaitingList} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                품목 선택 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                required
              >
                <option value="">품목을 선택하세요</option>
                {itemList.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.code || item.id}] {item.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                공장 선택 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.factoryId}
                onChange={(e) => setFormData({ ...formData, factoryId: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                required
              >
                <option value="">공장을 선택하세요</option>
                {factoryList.map((factory) => (
                  <option key={factory.id} value={factory.id}>
                    {factory.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수량 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="수량 입력"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                단위
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="개">개</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                출고 유형
              </label>
              <select
                value={formData.issueType}
                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="SHIPPING">배송</option>
                <option value="PRODUCTION">생산</option>
                <option value="RETURN">반품</option>
                <option value="DISPOSAL">폐기</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비고
              </label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="비고 입력"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-[#724323] px-6 py-2 font-medium text-white hover:bg-[#5a3419]"
            >
              대기 목록에 추가
            </button>
          </div>
        </form>
      </div>

      {/* 안내 메시지 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>안내:</strong> 위 양식으로 입력하면 "출고 관리" 페이지의 대기 목록에 추가됩니다. 
          대기 목록에서 "출고" 또는 "라벨 프린트" 버튼을 클릭하여 출고를 완료하세요.
        </p>
      </div>
    </div>
  );
}

export default Receiving;