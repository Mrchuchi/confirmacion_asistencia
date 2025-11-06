import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const showConfirmAlert = async (
  title: string,
  text: string,
  confirmButtonText = 'Sí',
  cancelButtonText = 'Cancelar'
): Promise<boolean> => {
  const result = await MySwal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    confirmButtonColor: '#0DB14B',
    cancelButtonColor: '#6c757d',
    customClass: {
      popup: 'swal2-popup-custom'
    }
  });
  return !!result.isConfirmed;
};

export const showSuccessAlert = (title: string, text?: string) => {
  return MySwal.fire({
    title,
    text,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    iconColor: '#0DB14B'
  });
};

export const showErrorAlert = (title: string, text?: string) => {
  return MySwal.fire({
    title,
    text,
    icon: 'error',
    showConfirmButton: true,
    confirmButtonColor: '#0DB14B'
  });
};

let toastInstance: ReturnType<typeof MySwal.mixin> | null = null;
export const showToast = (message: string, icon: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  if (!toastInstance) {
    toastInstance = MySwal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  return toastInstance.fire({
    icon,
    title: message
  });
};

let loadingInstance: Swal | null = null;
export const showLoadingAlert = (title = 'Cargando...') => {
  loadingInstance = MySwal.fire({
    title,
    allowOutsideClick: false,
    confirmButtonColor: '#0DB14B',
    didOpen: () => {
      Swal.showLoading();
    }
  });
  return loadingInstance;
};

export const closeLoadingAlert = () => {
  if (MySwal) MySwal.close();
};
