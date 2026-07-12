import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTheme } from "../../../hooks/useTheme";
import useUserSettings from "../../../hooks/useUserSettings";
import { useTranslation } from "../../../hooks/useTranslation";
import useFriendAccess from "../../../features/friends/hooks/useFriendAccess";
import useRedirectIfReadOnly from "../../../hooks/useRedirectIfReadOnly";

export default function useFormPage({ redirectConfig } = {}) {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";
  const currencySymbol = settings.getCurrency?.()?.symbol ?? "$";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const { friendId } = params;
  const { hasWriteAccess } = useFriendAccess(friendId);
  useRedirectIfReadOnly(friendId, redirectConfig || { auto: false });

  return {
    colors,
    settings,
    t,
    dateFormat,
    currencySymbol,
    navigate,
    dispatch,
    params,
    friendId,
    hasWriteAccess,
  };
}
