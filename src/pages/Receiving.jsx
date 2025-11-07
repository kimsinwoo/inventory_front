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
import { getItemByName } from '../data/items';
import { shippingAPI, inventoryAPI, receivingAPI } from '../api';

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
  const [waitingData, setWaitingData] = useState([
    {
      id: 1,
      itemCode: 'RAW001',
      itemName: '닭고기 (가슴살)',
      expectedQuantity: '50Kg',
      expectedDate: '2025-10-24',
      supplier: '신선식품',
    },
    {
      id: 2,
      itemCode: 'RAW002',
      itemName: '소고기(등심)',
      expectedQuantity: '70Kg',
      expectedDate: '2025-10-24',
      supplier: '프리미엄육가공',
    },
    {
      id: 3,
      itemCode: 'RAW003',
      itemName: '당근',
      expectedQuantity: '30Kg',
      expectedDate: '2025-10-25',
      supplier: '유기농산물',
    },
    {
      id: 4,
      itemCode: 'RAW004',
      itemName: '고구마',
      expectedQuantity: '40Kg',
      expectedDate: '2025-10-25',
      supplier: '유기농산물',
    },
  ]);

  // 입고 완료 목록 상태
  const [completedData, setCompletedData] = useState([]);

  // 출고 대기 목록 상태
  const [shippingWaitingData, setShippingWaitingData] = useState([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  // 출고 완료 목록 상태
  const [shippingCompletedData, setShippingCompletedData] = useState([]);

  // 출고 대기 목록 로드
  useEffect(() => {
    if (subPage === 'nav2') {
      loadShippingWaitingList();
      loadShippingCompletedList();
    }
  }, [subPage]);

  const loadShippingWaitingList = async () => {
    try {
      setIsLoadingShipping(true);
      // shipping API가 없을 경우 재고 이동 이력에서 출고 대기 상태를 가져오거나
      // 로컬 상태로 관리
      try {
        const response = await shippingAPI.getShippingList({ 
          status: 'pending' // 또는 'waiting' - 백엔드 API에 맞게 조정
        });
        const data = response.data?.data || response.data || [];
        setShippingWaitingData(Array.isArray(data) ? data : []);
      } catch (shippingError) {
        // shipping API가 없을 경우 재고 이동 이력에서 출고 이력 가져오기
        console.warn('shipping API 사용 불가, 재고 이동 이력 사용:', shippingError);
        const movementsResponse = await inventoryAPI.getMovements({ 
          type: 'issue',
          status: 'pending'
        });
        const movementsData = movementsResponse.data?.data || movementsResponse.data || [];
        // 재고 이동 이력을 출고 대기 목록 형식으로 변환
        const waitingList = Array.isArray(movementsData) 
          ? movementsData.map(movement => ({
              id: movement.id,
              itemCode: movement.itemCode || movement.code,
              itemName: movement.itemName || movement.category,
              expectedQuantity: `${movement.quantity || movement.expectedQuantity}${movement.unit || 'Kg'}`,
              expectedDate: movement.expectedDate || movement.date,
              supplier: movement.supplier || '공급업체',
            }))
          : [];
        setShippingWaitingData(waitingList);
      }
    } catch (error) {
      console.error('출고 대기 목록 로드 실패:', error);
      // 에러를 조용히 처리하고 빈 배열로 설정
      setShippingWaitingData([]);
    } finally {
      setIsLoadingShipping(false);
    }
  };

  const loadShippingCompletedList = async () => {
    try {
      // shipping API가 없을 경우 재고 이동 이력에서 출고 완료 상태를 가져오거나
      // 로컬 상태로 관리
      try {
        const response = await shippingAPI.getShippingList({ 
          status: 'completed' // 또는 'confirmed' - 백엔드 API에 맞게 조정
        });
        const data = response.data?.data || response.data || [];
        setShippingCompletedData(Array.isArray(data) ? data : []);
      } catch (shippingError) {
        // shipping API가 없을 경우 재고 이동 이력에서 출고 완료 이력 가져오기
        console.warn('shipping API 사용 불가, 재고 이동 이력 사용:', shippingError);
        const movementsResponse = await inventoryAPI.getMovements({ 
          type: 'issue',
          status: 'completed'
        });
        const movementsData = movementsResponse.data?.data || movementsResponse.data || [];
        // 재고 이동 이력을 출고 완료 목록 형식으로 변환
        const completedList = Array.isArray(movementsData)
          ? movementsData.map(movement => ({
              id: movement.id,
              itemCode: movement.itemCode || movement.code,
              itemName: movement.itemName || movement.category,
              expectedQuantity: `${movement.expectedQuantity || movement.quantity}${movement.unit || 'Kg'}`,
              shippedQuantity: `${movement.quantity || movement.shippedQuantity}${movement.unit || 'Kg'}`,
              unitCount: movement.unitCount || '1',
              shippedDate: movement.shippedDate || movement.date,
              status: movement.status || '정상',
            }))
          : [];
        setShippingCompletedData(completedList);
      }
    } catch (error) {
      console.error('출고 완료 목록 로드 실패:', error);
      // 에러를 조용히 처리하고 빈 배열로 설정
      setShippingCompletedData([]);
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
      // 백엔드 API를 통해 입고 대기 항목 저장
      await receivingAPI.createReceiving(formData);
      
      showAlert('입고 대기 목록에 추가되었습니다.', 'success');
      setIsModalOpen(false);
      
      // 목록 새로고침 (입고 대기 목록 로드 함수가 있다면 호출)
      // loadReceivingWaitingList(); // 필요시 구현
    } catch (error) {
      console.error('입고 목록 추가 실패:', error);
      showAlert(
        error.response?.data?.message || '입고 목록 추가에 실패했습니다.',
        'error'
      );
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
  const handleConfirmReceive = () => {
    if (!selectedItem) return;

    // 대기 목록에서 제거
    setWaitingData(waitingData.filter((data) => data.id !== selectedItem.id));

    // 완료 목록에 추가
    const completedItem = {
      id: Date.now(),
      itemCode: selectedItem.itemCode,
      itemName: selectedItem.itemName,
      expectedQuantity: selectedItem.expectedQuantity,
      receivedQuantity: `${selectedItem.receivedQuantity}Kg`,
      unitCount: selectedItem.unitCount,
      receivedDate: new Date().toISOString().split('T')[0],
      status: '정상',
    };

    setCompletedData([completedItem, ...completedData]);
    showAlert('입고가 완료되었습니다.', 'success');
    handleCloseConfirmModal();
  };

  // 입고 취소 (완료 목록 -> 대기 목록)
  const handleCancelReceiving = (id) => {
    const item = completedData.find((data) => data.id === id);
    if (!item) return;

    if (!confirm('입고를 취소하시겠습니까? 대기 목록으로 돌아갑니다.')) return;

    // 완료 목록에서 제거
    setCompletedData(completedData.filter((data) => data.id !== id));

    // 대기 목록에 다시 추가
    const waitingItem = {
      id: Date.now(),
      itemCode: item.itemCode,
      itemName: item.itemName,
      expectedQuantity: item.expectedQuantity,
      expectedDate: new Date().toISOString().split('T')[0],
      supplier: '공급업체',
    };

    setWaitingData([...waitingData, waitingItem]);
    showAlert('입고가 취소되었습니다.', 'info');
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
      // 입고 처리
      if (selectedItem?.receivedQuantity && selectedItem?.unitCount) {
        setWaitingData(waitingData.filter((data) => data.id !== selectedItem.id));
        const completedItem = {
          id: Date.now(),
          itemCode: selectedItem.itemCode,
          itemName: selectedItem.itemName,
          expectedQuantity: selectedItem.expectedQuantity,
          receivedQuantity: `${selectedItem.receivedQuantity}`,
          unitCount: selectedItem.unitCount,
          receivedDate: new Date().toISOString().split('T')[0],
          status: '정상',
        };
        setCompletedData([completedItem, ...completedData]);
        showAlert('라벨 프린트 및 입고가 완료되었습니다.', 'success');
        handleCloseConfirmModal();
      } else {
        showAlert('라벨을 프린트했습니다.', 'success');
      }
    } else {
      // 출고 처리
      if (selectedItem?.shippedQuantity && selectedItem?.unitCount) {
        try {
          // 출고 확인 - shipping API 또는 inventory API 사용
          try {
            await shippingAPI.confirmShipping(selectedItem.id);
          } catch (shippingError) {
            // shipping API가 없을 경우 inventory API의 issueInventory 사용
            console.warn('shipping API 사용 불가, inventory API 사용:', shippingError);
            await inventoryAPI.issueInventory({
              itemId: selectedItem.itemId || selectedItem.id,
              itemCode: selectedItem.itemCode,
              quantity: parseFloat(selectedItem.shippedQuantity) || parseFloat(selectedItem.expectedQuantity),
              unit: selectedItem.unit || 'Kg',
              date: new Date().toISOString().split('T')[0],
              note: '출고 처리',
            });
          }
          
          // 로컬 상태 업데이트
          setShippingWaitingData(shippingWaitingData.filter((data) => data.id !== selectedItem.id));
          const completedItem = {
            id: Date.now(),
            itemCode: selectedItem.itemCode,
            itemName: selectedItem.itemName,
            expectedQuantity: selectedItem.expectedQuantity,
            shippedQuantity: `${selectedItem.shippedQuantity}`,
            unitCount: selectedItem.unitCount,
            shippedDate: new Date().toISOString().split('T')[0],
            status: '정상',
          };
          setShippingCompletedData([completedItem, ...shippingCompletedData]);
          
          showAlert('라벨 프린트 및 출고가 완료되었습니다.', 'success');
          handleCloseConfirmModal();
          
          // 목록 새로고침
          await loadShippingWaitingList();
          await loadShippingCompletedList();
        } catch (error) {
          console.error('출고 확인 실패:', error);
          showAlert(
            error.response?.data?.message || '출고 확인에 실패했습니다.',
            'error'
          );
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
      const itemInfo = getItemByName(formData.itemName);
      
      // 백엔드 API에 맞는 데이터 형식으로 변환
      const shippingData = {
        itemCode: formData.itemCode,
        itemName: formData.itemName,
        expectedQuantity: parseFloat(formData.expectedQuantity),
        unit: formData.unit,
        expectedDate: formData.expectedDate,
        status: 'pending', // 대기 상태
        supplier: itemInfo?.supplier || '공급업체',
      };

      try {
        await shippingAPI.createShipping(shippingData);
      } catch (shippingError) {
        // shipping API가 없을 경우 로컬 상태로 관리
        console.warn('shipping API 사용 불가, 로컬 상태로 관리:', shippingError);
        const newWaitingItem = {
          id: Date.now(),
          itemCode: formData.itemCode,
          itemName: formData.itemName,
          expectedQuantity: `${formData.expectedQuantity}${formData.unit}`,
          expectedDate: formData.expectedDate,
          supplier: itemInfo?.supplier || '공급업체',
        };
        setShippingWaitingData([...shippingWaitingData, newWaitingItem]);
      }
      
      showAlert('출고 대기 목록에 추가되었습니다.', 'success');
      setIsModalOpen(false);
      
      // 목록 새로고침
      await loadShippingWaitingList();
    } catch (error) {
      console.error('출고 목록 추가 실패:', error);
      showAlert(
        error.response?.data?.message || '출고 목록 추가에 실패했습니다.',
        'error'
      );
    }
  };

  const handleShip = (item) => {
    setSelectedItem(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmShip = async () => {
    if (!selectedItem) return;

    try {
      // 출고 확인 - shipping API 또는 inventory API 사용
      try {
        await shippingAPI.confirmShipping(selectedItem.id);
      } catch (shippingError) {
        // shipping API가 없을 경우 inventory API의 issueInventory 사용
        console.warn('shipping API 사용 불가, inventory API 사용:', shippingError);
        await inventoryAPI.issueInventory({
          itemId: selectedItem.itemId || selectedItem.id,
          itemCode: selectedItem.itemCode,
          quantity: parseFloat(selectedItem.shippedQuantity) || parseFloat(selectedItem.expectedQuantity),
          unit: selectedItem.unit || 'Kg',
          date: new Date().toISOString().split('T')[0],
          note: '출고 처리',
        });
      }
      
      // 로컬 상태 업데이트
      setShippingWaitingData(shippingWaitingData.filter((data) => data.id !== selectedItem.id));
      const completedItem = {
        id: Date.now(),
        itemCode: selectedItem.itemCode,
        itemName: selectedItem.itemName,
        expectedQuantity: selectedItem.expectedQuantity,
        shippedQuantity: `${selectedItem.shippedQuantity}Kg`,
        unitCount: selectedItem.unitCount,
        shippedDate: new Date().toISOString().split('T')[0],
        status: '정상',
      };
      setShippingCompletedData([completedItem, ...shippingCompletedData]);
      
      showAlert('출고가 완료되었습니다.', 'success');
      handleCloseConfirmModal();
      
      // 목록 새로고침
      await loadShippingWaitingList();
      await loadShippingCompletedList();
    } catch (error) {
      console.error('출고 확인 실패:', error);
      showAlert(
        error.response?.data?.message || '출고 확인에 실패했습니다.',
        'error'
      );
    }
  };

  const handleCancelShipping = async (id) => {
    const item = shippingCompletedData.find((data) => data.id === id);
    if (!item) return;
    if (!confirm('출고를 취소하시겠습니까? 대기 목록으로 돌아갑니다.')) return;

    try {
      // 출고 취소 - shipping API 또는 로컬 상태로 관리
      try {
        await shippingAPI.updateShipping(id, {
          status: 'pending',
          cancelledAt: new Date().toISOString(),
        });
      } catch (shippingError) {
        // shipping API가 없을 경우 로컬 상태로 관리
        console.warn('shipping API 사용 불가, 로컬 상태로 관리:', shippingError);
        setShippingCompletedData(shippingCompletedData.filter((data) => data.id !== id));
        const waitingItem = {
          id: Date.now(),
          itemCode: item.itemCode,
          itemName: item.itemName,
          expectedQuantity: item.expectedQuantity,
          expectedDate: new Date().toISOString().split('T')[0],
          supplier: '공급업체',
        };
        setShippingWaitingData([...shippingWaitingData, waitingItem]);
      }
      
      showAlert('출고가 취소되었습니다.', 'info');
      
      // 목록 새로고침
      await loadShippingWaitingList();
      await loadShippingCompletedList();
    } catch (error) {
      console.error('출고 취소 실패:', error);
      showAlert(
        error.response?.data?.message || '출고 취소에 실패했습니다.',
        'error'
      );
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
            onLabelPrint={() => handleLabelPrint(selectedItem)}
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