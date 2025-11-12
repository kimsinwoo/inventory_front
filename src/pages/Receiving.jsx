import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
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
import { shippingAPI, plannedTransactionsAPI } from '../api';

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

  // 입고 대기 목록 상태
  const [waitingData, setWaitingData] = useState([]);
  const [isLoadingReceiving, setIsLoadingReceiving] = useState(false);

  // 입고 완료 목록 상태
  const [completedData, setCompletedData] = useState([]);

  // 출고 대기 목록 상태
  const [shippingWaitingData, setShippingWaitingData] = useState([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  // 출고 완료 목록 상태
  const [shippingCompletedData, setShippingCompletedData] = useState([]);

  // 헬퍼 함수: item 객체에서 itemCode와 itemName 안전하게 추출
  const extractItemInfo = (item) => {
    let itemCode = '-';
    let itemName = '-';
    
    // item.item가 객체인 경우 처리
    if (item.item && typeof item.item === 'object' && item.item !== null && !Array.isArray(item.item)) {
      // item.item 객체에서 code와 name 추출
      const itemObj = item.item;
      
      // code 추출 (문자열인지 확인)
      if (itemObj.code && typeof itemObj.code === 'string') {
        itemCode = itemObj.code;
      } else if (itemObj.itemCode && typeof itemObj.itemCode === 'string') {
        itemCode = itemObj.itemCode;
      } else if (itemObj.id && typeof itemObj.id === 'string') {
        itemCode = itemObj.id;
      } else if (itemObj.id && typeof itemObj.id === 'number') {
        itemCode = String(itemObj.id);
      }
      
      // name 추출 (문자열인지 확인)
      if (itemObj.name && typeof itemObj.name === 'string') {
        itemName = itemObj.name;
      } else if (itemObj.itemName && typeof itemObj.itemName === 'string') {
        itemName = itemObj.itemName;
      }
    }
    
    // item.item가 객체가 아니거나 값이 없는 경우 직접 필드에서 추출
    if (itemCode === '-') {
      if (item.item_code && typeof item.item_code === 'string') {
        itemCode = item.item_code;
      } else if (item.itemCode && typeof item.itemCode === 'string') {
        itemCode = item.itemCode;
      } else if (typeof item.item === 'string') {
        itemCode = item.item;
      }
    }
    
    if (itemName === '-') {
      if (item.item_name && typeof item.item_name === 'string') {
        itemName = item.item_name;
      } else if (item.itemName && typeof item.itemName === 'string') {
        itemName = item.itemName;
      }
    }
    
    return {
      itemCode: itemCode || '-',
      itemName: itemName || '-',
    };
  };

  // 입고/출고 목록 로드
  useEffect(() => {
    if (subPage === 'nav1') {
      // 입고 탭
      loadReceivingWaitingList();
      loadReceivingCompletedList();
    } else if (subPage === 'nav2') {
      // 출고 탭
      loadShippingWaitingList();
      loadShippingCompletedList();
    }
  }, [subPage]);

  // 입고 대기 목록 로드
  const loadReceivingWaitingList = async () => {
    try {
      setIsLoadingReceiving(true);
      console.log('📦 입고 대기 목록 로드 시작...');
      // planned-transactions API에서 입고 예정 트랜잭션 조회 (RECEIVE, PENDING 또는 APPROVED 상태)
      const response = await plannedTransactionsAPI.getPlannedTransactions({
        transactionType: 'RECEIVE',
        // status는 백엔드에서 지원하는 형식에 따라 조정 가능
        // 여러 상태를 조회하려면 배열이나 쉼표로 구분된 문자열 사용
      });
      const data = response.data?.data || response.data || [];
      const transactionsList = Array.isArray(data) ? data : [];
      
      // API 데이터를 컴포넌트 형식에 맞게 변환
      const formattedData = transactionsList.map((item) => {
        const { itemCode, itemName } = extractItemInfo(item);
        
        // 최종적으로 문자열이 아닌 경우 처리 (null, undefined, 객체 등)
        const safeItemCode = itemCode && typeof itemCode === 'string' ? itemCode : String(itemCode || '-');
        const safeItemName = itemName && typeof itemName === 'string' ? itemName : String(itemName || '-');
        
        return {
          id: item.id,
          itemCode: safeItemCode,
          itemName: safeItemName,
          expectedQuantity: item.quantity ? `${item.quantity} ${item.unit || 'kg'}` : '0',
          expectedDate: item.scheduled_date || item.scheduledDate || item.expected_date || item.expectedDate || '',
          supplier: item.supplier_name || item.supplierName || '공급업체',
          transactionId: item.id,
        };
      });
      
      setWaitingData(formattedData);
      console.log('✅ 입고 대기 목록 로드 완료:', formattedData);
    } catch (error) {
      console.error('❌ 입고 대기 목록 로드 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '입고 대기 목록을 불러오는데 실패했습니다.';
      showAlert(errorMessage, 'error');
      setWaitingData([]);
    } finally {
      setIsLoadingReceiving(false);
    }
  };

  // 입고 완료 목록 로드
  const loadReceivingCompletedList = async () => {
    try {
      console.log('📦 입고 완료 목록 로드 시작...');
      // planned-transactions API에서 입고 완료 트랜잭션 조회 (RECEIVE, COMPLETED 상태)
      const response = await plannedTransactionsAPI.getPlannedTransactions({
        transactionType: 'RECEIVE',
        status: 'COMPLETED', // 완료 상태
      });
      const data = response.data?.data || response.data || [];
      const transactionsList = Array.isArray(data) ? data : [];
      
      // API 데이터를 컴포넌트 형식에 맞게 변환
      const formattedData = transactionsList.map((item) => {
        const { itemCode, itemName } = extractItemInfo(item);
        
        // 최종적으로 문자열이 아닌 경우 처리 (null, undefined, 객체 등)
        const safeItemCode = itemCode && typeof itemCode === 'string' ? itemCode : String(itemCode || '-');
        const safeItemName = itemName && typeof itemName === 'string' ? itemName : String(itemName || '-');
        
        return {
          id: item.id,
          itemCode: safeItemCode,
          itemName: safeItemName,
          expectedQuantity: item.quantity ? `${item.quantity} ${item.unit || 'kg'}` : '0',
          receivedQuantity: item.received_quantity || item.receivedQuantity || item.quantity || '0',
          unitCount: item.unit_count || item.unitCount || '1',
          receivedDate: item.completed_date || item.completedDate || item.updated_at || item.created_at || '',
          status: '정상',
          transactionId: item.id,
        };
      });
      
      setCompletedData(formattedData);
      console.log('✅ 입고 완료 목록 로드 완료:', formattedData);
    } catch (error) {
      console.error('❌ 입고 완료 목록 로드 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '입고 완료 목록을 불러오는데 실패했습니다.';
      showAlert(errorMessage, 'error');
      setCompletedData([]);
    }
  };

  const loadShippingWaitingList = async () => {
    try {
      setIsLoadingShipping(true);
      console.log('📦 출고 대기 목록 로드 시작...');
      // planned-transactions API에서 출고 예정 트랜잭션 조회 (ISSUE, PENDING 또는 APPROVED 상태)
      const response = await plannedTransactionsAPI.getPlannedTransactions({
        transactionType: 'ISSUE',
        // status는 백엔드에서 지원하는 형식에 따라 조정 가능
        // 여러 상태를 조회하려면 배열이나 쉼표로 구분된 문자열 사용
      });
      const data = response.data?.data || response.data || [];
      const transactionsList = Array.isArray(data) ? data : [];
      
      // API 데이터를 컴포넌트 형식에 맞게 변환
      const formattedData = transactionsList.map((item) => {
        const { itemCode, itemName } = extractItemInfo(item);
        
        // 최종적으로 문자열이 아닌 경우 처리 (null, undefined, 객체 등)
        const safeItemCode = itemCode && typeof itemCode === 'string' ? itemCode : String(itemCode || '-');
        const safeItemName = itemName && typeof itemName === 'string' ? itemName : String(itemName || '-');
        
        return {
          id: item.id,
          itemCode: safeItemCode,
          itemName: safeItemName,
          expectedQuantity: item.quantity ? `${item.quantity} ${item.unit || 'kg'}` : '0',
          shippedQuantity: item.shipped_quantity || item.shippedQuantity || '',
          unitCount: item.unit_count || item.unitCount || '1',
          expectedDate: item.scheduled_date || item.scheduledDate || item.expected_date || item.expectedDate || '',
          transactionId: item.id,
        };
      });
      
      setShippingWaitingData(formattedData);
      console.log('✅ 출고 대기 목록 로드 완료:', formattedData);
    } catch (error) {
      console.error('❌ 출고 대기 목록 로드 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '출고 대기 목록을 불러오는데 실패했습니다.';
      showAlert(errorMessage, 'error');
      setShippingWaitingData([]);
    } finally {
      setIsLoadingShipping(false);
    }
  };

  const loadShippingCompletedList = async () => {
    try {
      console.log('📦 출고 완료 목록 로드 시작...');
      // planned-transactions API에서 출고 완료 트랜잭션 조회 (ISSUE, COMPLETED 상태)
      const response = await plannedTransactionsAPI.getPlannedTransactions({
        transactionType: 'ISSUE',
        status: 'COMPLETED', // 완료 상태
      });
      const data = response.data?.data || response.data || [];
      const transactionsList = Array.isArray(data) ? data : [];
      
      // API 데이터를 컴포넌트 형식에 맞게 변환
      const formattedData = transactionsList.map((item) => {
        const { itemCode, itemName } = extractItemInfo(item);
        
        // 최종적으로 문자열이 아닌 경우 처리 (null, undefined, 객체 등)
        const safeItemCode = itemCode && typeof itemCode === 'string' ? itemCode : String(itemCode || '-');
        const safeItemName = itemName && typeof itemName === 'string' ? itemName : String(itemName || '-');
        
        return {
          id: item.id,
          itemCode: safeItemCode,
          itemName: safeItemName,
          expectedQuantity: item.quantity ? `${item.quantity} ${item.unit || 'kg'}` : '0',
          shippedQuantity: item.shipped_quantity || item.shippedQuantity || item.issued_quantity || item.issuedQuantity || item.quantity || '0',
          unitCount: item.unit_count || item.unitCount || '1',
          completedDate: item.completed_date || item.completedDate || item.updated_at || item.created_at || '',
          transactionId: item.id,
        };
      });
      
      setShippingCompletedData(formattedData);
      console.log('✅ 출고 완료 목록 로드 완료:', formattedData);
    } catch (error) {
      console.error('❌ 출고 완료 목록 로드 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '출고 완료 목록을 불러오는데 실패했습니다.';
      showAlert(errorMessage, 'error');
      setShippingCompletedData([]);
    }
  };

  const handleAddReceiving = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 대기 목록 추가 (입고)
  const handleSubmitReceiving = async (formData) => {
    try {
      console.log('📦 입고 추가 시작...', formData);
      
      // planned-transactions API를 사용하여 입고 예정 트랜잭션 생성
      const transactionData = {
        transactionType: 'RECEIVE', // 입고
        itemId: parseInt(formData.selectedItemId) || parseInt(formData.itemCode) || null,
        factoryId: parseInt(formData.factoryId) || null,
        quantity: parseFloat(formData.expectedQuantity) || 0,
        unit: formData.unit || 'kg',
        scheduledDate: formData.expectedDate,
        supplierName: formData.supplierName || '',
        barcode: formData.barcode || '',
        wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : undefined,
        storageConditionId: formData.storageConditionId ? parseInt(formData.storageConditionId) : undefined,
        notes: formData.notes || '',
      };
      
      // 필수 필드 검증
      if (!transactionData.itemId) {
        showAlert('품목을 선택해주세요.', 'error');
        return;
      }
      if (!transactionData.factoryId) {
        showAlert('공장을 선택해주세요.', 'error');
        return;
      }
      if (!transactionData.quantity || transactionData.quantity <= 0) {
        showAlert('주문량을 입력해주세요.', 'error');
        return;
      }
      if (!transactionData.scheduledDate) {
        showAlert('입고예정일을 선택해주세요.', 'error');
        return;
      }
      
      const response = await plannedTransactionsAPI.createPlannedTransaction(transactionData);
      
      console.log('✅ 입고 추가 완료:', response.data);
      showAlert('입고 대기 목록에 추가되었습니다.', 'success');
      setIsModalOpen(false);
      
      // 목록 새로고침
      await loadReceivingWaitingList();
    } catch (error) {
      console.error('❌ 입고 목록 추가 실패:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || '입고 목록 추가에 실패했습니다.';
      showAlert(errorMessage, 'error');
    }
  };

  // 입고 버튼 클릭 시 확인 모달 열기
  const handleReceive = (item) => {
    setSelectedItem(item);
    setIsConfirmModalOpen(true);
  };

  // 입고 확인 모달 닫기
  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedItem(null);
  };

  // 입고 처리 확정 (대기 목록 -> 완료 목록)
  const handleConfirmReceive = async () => {
    if (!selectedItem) return;

    try {
      console.log('📦 입고 확정 시작...', selectedItem);
      const transactionId = selectedItem.transactionId || selectedItem.id;
      if (!transactionId) {
        showAlert('트랜잭션 ID가 없습니다.', 'error');
        return;
      }

      // planned-transactions API의 completeReceive 사용
      await plannedTransactionsAPI.completeReceive(transactionId, {
        receivedQuantity: selectedItem.receivedQuantity ? parseFloat(selectedItem.receivedQuantity) : undefined,
        unitCount: selectedItem.unitCount ? parseInt(selectedItem.unitCount) : undefined,
      });
      
      console.log('✅ 입고 확정 완료');
      showAlert('입고가 완료되었습니다.', 'success');
      handleCloseConfirmModal();
      
      // 목록 새로고침
      await loadReceivingWaitingList();
      await loadReceivingCompletedList();
    } catch (error) {
      console.error('❌ 입고 확정 실패:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || '입고 확정에 실패했습니다.';
      showAlert(errorMessage, 'error');
    }
  };

  // 입고 취소 (완료 목록 -> 대기 목록)
  const handleCancelReceiving = async (id) => {
    const item = completedData.find((data) => data.id === id);
    if (!item) return;

    if (!confirm('입고를 취소하시겠습니까? 대기 목록으로 돌아갑니다.')) return;

    try {
      console.log('📦 입고 취소 시작...', id);
      const transactionId = item.transactionId || item.id;
      if (!transactionId) {
        showAlert('트랜잭션 ID가 없습니다.', 'error');
        return;
      }

      // planned-transactions API의 reject 사용 (또는 상태 변경)
      await plannedTransactionsAPI.reject(transactionId, {
        reason: '입고 취소',
      });
      
      console.log('✅ 입고 취소 완료');
      showAlert('입고가 취소되었습니다.', 'info');
      
      // 목록 새로고침
      await loadReceivingWaitingList();
      await loadReceivingCompletedList();
    } catch (error) {
      console.error('❌ 입고 취소 실패:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || '입고 취소에 실패했습니다.';
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

  // 라벨 프린트 완료 후 입고 완료 처리
  const handleLabelPrintComplete = async (labelData) => {
    if (subPage === 'nav1') {
      // 입고 처리 (API 사용)
      if (selectedItem?.receivedQuantity && selectedItem?.unitCount) {
        try {
          console.log('📦 라벨 프린트 후 입고 확정 시작...', selectedItem);
          const transactionId = selectedItem.transactionId || selectedItem.id;
          if (!transactionId) {
            showAlert('트랜잭션 ID가 없습니다.', 'error');
            return;
          }

          // planned-transactions API의 completeReceive 사용
          await plannedTransactionsAPI.completeReceive(transactionId, {
            receivedQuantity: selectedItem.receivedQuantity ? parseFloat(selectedItem.receivedQuantity) : undefined,
            unitCount: selectedItem.unitCount ? parseInt(selectedItem.unitCount) : undefined,
          });
          
          console.log('✅ 라벨 프린트 후 입고 확정 완료');
          showAlert('라벨 프린트 및 입고가 완료되었습니다.', 'success');
          handleCloseConfirmModal();
          
          // 목록 새로고침
          await loadReceivingWaitingList();
          await loadReceivingCompletedList();
        } catch (error) {
          console.error('❌ 입고 확인 실패:', error);
          const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || '입고 확인에 실패했습니다.';
          showAlert(errorMessage, 'error');
        }
      } else {
        showAlert('라벨을 프린트했습니다.', 'success');
      }
    } else {
      // 출고 처리 (API 사용)
      if (selectedItem?.shippedQuantity && selectedItem?.unitCount) {
        try {
          console.log('📦 라벨 프린트 후 출고 확정 시작...', selectedItem);
          const transactionId = selectedItem.transactionId || selectedItem.id;
          if (!transactionId) {
            showAlert('트랜잭션 ID가 없습니다.', 'error');
            return;
          }

          // planned-transactions API의 completeIssue 사용
          await plannedTransactionsAPI.completeIssue(transactionId, {
            shippedQuantity: selectedItem.shippedQuantity ? parseFloat(selectedItem.shippedQuantity) : undefined,
            unitCount: selectedItem.unitCount ? parseInt(selectedItem.unitCount) : undefined,
          });
          
          console.log('✅ 라벨 프린트 후 출고 확정 완료');
          showAlert('라벨 프린트 및 출고가 완료되었습니다.', 'success');
          handleCloseConfirmModal();
          
          // 목록 새로고침
          await loadShippingWaitingList();
          await loadShippingCompletedList();
        } catch (error) {
          console.error('❌ 출고 확인 실패:', error);
          const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || '출고 확인에 실패했습니다.';
          showAlert(errorMessage, 'error');
        }
      } else {
        showAlert('라벨을 프린트했습니다.', 'success');
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
      console.log('📦 출고 추가 시작...', formData);
      
      // planned-transactions API를 사용하여 출고 예정 트랜잭션 생성
      const transactionData = {
        transactionType: 'ISSUE', // 출고
        itemId: parseInt(formData.selectedItemId) || parseInt(formData.itemCode) || null,
        factoryId: parseInt(formData.factoryId) || null,
        quantity: parseFloat(formData.expectedQuantity) || 0,
        unit: formData.unit || 'kg',
        scheduledDate: formData.expectedDate,
        customerName: formData.customerName || '',
        issueType: formData.issueType || '',
        shippingAddress: formData.shippingAddress || '',
        notes: formData.notes || '',
      };
      
      // 필수 필드 검증
      if (!transactionData.itemId) {
        showAlert('품목을 선택해주세요.', 'error');
        return;
      }
      if (!transactionData.factoryId) {
        showAlert('공장을 선택해주세요.', 'error');
        return;
      }
      if (!transactionData.quantity || transactionData.quantity <= 0) {
        showAlert('주문량을 입력해주세요.', 'error');
        return;
      }
      if (!transactionData.scheduledDate) {
        showAlert('출고예정일을 선택해주세요.', 'error');
        return;
      }
      
      const response = await plannedTransactionsAPI.createPlannedTransaction(transactionData);
      
      console.log('✅ 출고 추가 완료:', response.data);
      showAlert('출고 대기 목록에 추가되었습니다.', 'success');
      setIsModalOpen(false);
      
      // 목록 새로고침
      await loadShippingWaitingList();
    } catch (error) {
      console.error('❌ 출고 목록 추가 실패:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || '출고 목록 추가에 실패했습니다.';
      showAlert(errorMessage, 'error');
    }
  };

  const handleShip = (item) => {
    setSelectedItem(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmShip = async () => {
    if (!selectedItem) return;

    try {
      console.log('📦 출고 확정 시작...', selectedItem);
      const transactionId = selectedItem.transactionId || selectedItem.id;
      if (!transactionId) {
        showAlert('트랜잭션 ID가 없습니다.', 'error');
        return;
      }

      // planned-transactions API의 completeIssue 사용
      await plannedTransactionsAPI.completeIssue(transactionId, {
        shippedQuantity: selectedItem.shippedQuantity ? parseFloat(selectedItem.shippedQuantity) : undefined,
        unitCount: selectedItem.unitCount ? parseInt(selectedItem.unitCount) : undefined,
      });
      
      console.log('✅ 출고 확정 완료');
      showAlert('출고가 완료되었습니다.', 'success');
      handleCloseConfirmModal();
      
      // 목록 새로고침
      await loadShippingWaitingList();
      await loadShippingCompletedList();
    } catch (error) {
      console.error('❌ 출고 확인 실패:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || '출고 확인에 실패했습니다.';
      showAlert(errorMessage, 'error');
    }
  };

  const handleCancelShipping = async (id) => {
    const item = shippingCompletedData.find((data) => data.id === id);
    if (!item) return;
    if (!confirm('출고를 취소하시겠습니까? 대기 목록으로 돌아갑니다.')) return;

    try {
      console.log('📦 출고 취소 시작...', id);
      const transactionId = item.transactionId || item.id;
      if (!transactionId) {
        showAlert('트랜잭션 ID가 없습니다.', 'error');
        return;
      }

      // planned-transactions API의 reject 사용 (또는 상태 변경)
      await plannedTransactionsAPI.reject(transactionId, {
        reason: '출고 취소',
      });
      
      console.log('✅ 출고 취소 완료');
      showAlert('출고가 취소되었습니다.', 'info');
      
      // 목록 새로고침
      await loadShippingWaitingList();
      await loadShippingCompletedList();
    } catch (error) {
      console.error('❌ 출고 취소 실패:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || '출고 취소에 실패했습니다.';
      showAlert(errorMessage, 'error');
    }
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
            : '출고 대기 목록 및 출고 완료 내역을 관리합니다'}
        </p>
      </div>

      {subPage === 'nav1' ? (
        <>
          {/* 입고 대기 목록 */}
          <div className='mb-6'>
            <ReceivingWaitingList
              waitingData={waitingData}
              onAddReceiving={handleAddReceiving}
              onReceive={handleReceive}
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

          {/* 입고 확인 모달 */}
          <ReceivingConfirmModal
            isOpen={isConfirmModalOpen}
            onClose={handleCloseConfirmModal}
            onConfirm={handleConfirmReceive}
            onLabelPrint={() => handleLabelPrint(selectedItem)}
            itemData={selectedItem}
          />
        </>
      ) : (
        <>
          {/* 출고 대기 목록 */}
          <div className='mb-6'>
            <ShippingWaitingList
              waitingData={shippingWaitingData}
              onAddShipping={handleAddShipping}
              onShip={handleShip}
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

          {/* 출고 확인 모달 */}
          <ShippingConfirmModal
            isOpen={isConfirmModalOpen}
            onClose={handleCloseConfirmModal}
            onConfirm={handleConfirmShip}
            onLabelPrint={(item) => {
              handleCloseConfirmModal();
              handleLabelPrint(item);
            }}
            itemData={selectedItem}
          />
        </>
      )}

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

export default Receiving;