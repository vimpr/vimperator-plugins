/* NEW BSD LICENSE {{{
Copyright (c) 2008, anekos.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
    3. The names of the authors may not be used to endorse or promote products
       derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
THE POSSIBILITY OF SUCH DAMAGE.


###################################################################################
# http://sourceforge.jp/projects/opensource/wiki/licenses%2Fnew_BSD_license       #
# に参考になる日本語訳がありますが、有効なのは上記英文となります。                #
###################################################################################

}}} */

var PLUGIN_INFO =
<VimperatorPlugin>
  <name>Foxy Tunes</name>
  <description>for FoxyTunes</description>
  <description lang="ja">for FoxyTunes</description>
  <version>0.3.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/foxytunes.js</updateURL>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <detail><![CDATA[
    == Commands ==
      + :ftplay
      + :ftpause
      + :ftnext
      + :ftprevious
      + :ftvolume <VOLUME>
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Commands ==
      + :ftplay
      + :ftpause
      + :ftnext
      + :ftprevious
      + :ftvolume <VOLUME>
  ]]></detail>
</VimperatorPlugin>;

(function () {

  // 上手い具合に病数に直すよ
  function fromTimeCode (code) {
    let m;
    function sign (s, v)
      (s == '-' ? -v : v);
    if (m = code.match(/^([-+])?(\d+):(\d+)$/))
      return sign(m[1], parseInt(m[2]) * 60 + parseInt(m[3]));
    if (m = code.match(/^([-+])?(\d+\.\d+)$/))
      return sign(m[1], parseFloat(m[2]) * 60);
    return parseInt(code);
  }

  let player = Components.classes['@foxytunes.org/FoxyTunesEngine/FoxyTunesService;1'].getService();

  // foxytunesDispatchPlayerCommand
  ['Pause', 'Play', 'Next', 'Previous'].forEach(function (name) {
    let ln = name.toLowerCase();
    let lnm = ln.match(/(..)(.*)/);
    commands.addUserCommand(
      ['ft' + lnm[1] + '[' + lnm[2] + ']'],
      name + ' - FoxyTunes',
      function () foxytunesDispatchPlayerCommand(name, true),
      true
    );
  });

  // volume
  commands.addUserCommand(
    ['ftvo[lume]'],
    'Set Volume - FoxyTunes',
    function (args) {
      let v = parseInt(args.string || '0', 10);
      let volume = args.bang ? Math.min(Math.max(foxytunesGetVolume() + v, 0), 100)
                             : Math.min(Math.max(v, 0), 100);
      foxytunesSetVolume(v);
    },
    {
      argCount: '*'
    },
    true
  );

})();

/*
  FoxyTunes が window に設置する関数の数々…
  gFoxytunesYMPPageAnalyzer
  FoxyTunesHTMLTooltip
  FoxyTunesTooltipInfo
  FoxytunesYMPPageAnalyzer
  FoxytunesThunderbirdSignatures
  FoxytunesSignatures
  FoxytunesSignaturesSiteHandler
  FoxyTunesFeedMenuPopupUI
  FoxyTunesSearchEngine
  FoxyTunesSearchTermsBuilder
  FoxyTunesSearchExecuter
  foxytunescontextMenuExecuteSearch
  foxytunesExecuteSearch
  foxytunesInitMusicSearchMenuPopup
  gFoxytunesSignatures
  gFoxyTunesUninstallObserver
  gbFoxyTunesIgnorePrefChange
  gFoxyTunesRecentPlayers
  gFoxyTunesInfoBoxShowTimerId
  gFoxyTunesInfoBoxHideTimerId
  gFoxyTunesInfoBoxWindow
  gbFoxyTunesInfoBoxWindowOpened
  gbFoxyTunesInfoPopupVisible
  gFoxyTunesDOMParser
  gbFoxyTunesShiftDown
  gbFoxyTunesNoTitlePopup
  gFoxyTunesUpdateTitleOnCommandTimerID
  gbFoxyTunesDontUpdateTitleOnCommand
  gFoxyTunesMaxLinksForWebMedia
  gFoxyTunesAutoHideTimeout
  gFoxyTunesAllButtonsAutohideTimerID
  gFoxyTunesCurrentTrackTitle
  gFoxyTunesTrackInfoTooltipHeight
  gFoxyTunesPlayerObj
  gFoxyTunesCurrentPlayerClass
  gFoxyTunesInsertAfterElementId
  gFoxyTunesInsertBeforeElementId
  gFoxyTunesParentElementID
  gbFoxyTunesOpenWindowInTab
  gFoxyTunesCurrentPlayerOptions
  gFoxyTunesCustomPlayerOptions
  gFoxyTunesMaxRecentCharsets
  gFoxyTunesRecentCharsets
  gFoxyTunesAllCharSets
  gbFoxyTunesChangingSliderPos
  gbFoxyTunesPlaying
  gFoxyTunesTrackInfoTimerID
  gFoxyTunesCharacterEncoding
  gFoxytunesUtils
  gFoxyTunesUnicodeConverter
  foxytunesScriptableUnicodeConverter
  gFoxyTunesPref
  gFoxyTunesPrefService
  foxytunesDragAndDropObserver
  foxytunesGenarateUrlsFromUrl
  foxytunesGenarateUrlsFromFileOrDirectory
  foxytunesSetAmazonStoreOption
  foxytunesSetAmazonStore
  foxytunesInstallTwittyTunes
  foxytunesOpenTwittyTunesDialog
  foxytunesUninitOverlay
  foxytunesInitOverlay
  foxytunesShowStatusBarUponFreshInstall
  foxytunesUninstallObserver
  foxytunesUpdateFoxytunesVersionAndShowWelcomeScreenIfNeeded
  foxytunesClearQuickSwitch
  foxytunesCustomizeWebSearchEngine
  foxytunesInitMinibrowserOverlay
  foxytunesObserveContextMenu
  foxytunesObserveSwitchPlayer
  gFoxyTunesSwitchPlayerObserver
  foxytunesObserveTrackData
  foxytunesObservePrefs
  gFoxyTunesPreferencesObserver
  gFoxyTunesTrackDataObserver
  foxytunesDoPlatformSpecificUIChanges
  foxytunesDisableFoxyTunesMini
  foxytunesShowPleaseWait
  foxytunesModuleInstallationFailed
  foxytunesSeaMonkeyInstallFixer
  foxytunesOnQuickPlayerSwitch
  foxytunesPopulateRecentPlayers
  foxytunesOnMainMenuShowing
  foxytunesAlertStreamNotSupported
  foxytunesStreamIsSupportedInCurrentPlayer
  foxytunesGetSupportedRegExp
  foxytunesURLIsMedia
  foxytunesOnContextPopupShowing
  foxytunesShowOrHideContextMenuItems
  foxytunesSetElementHiddenAttrByFtpref
  foxytunesPopulateFeedMenu
  foxytunesPopulatePageMediaMenu
  foxytunesGetLinkDescription
  foxytunesPlayMedia
  foxytunesOpenMinimode
  foxytunesOnMouseMove
  foxytunesOnBrowserStatusChanged
  foxytunesVerifyWidth
  foxytunesRestoreIfHidden
  foxytunesShowRestartBrowserAlert
  foxytunesEmusicSpecificInit
  foxytunesSeaMonkeySpecificInit
  foxytunesThunderbirdSpecificInit
  foxytunesRenameMainDll
  foxytunesShowUpdateAvailableButtonIfNeeded
  foxytunesUpdateAvailableButtonIsDisabled
  foxytunesDisableUpdateAvailableButton
  foxytunesGotoUpdateURL
  foxytunesFoxyTunesHasUpdates
  foxytunesGetFoxyTunesAvailableUpdateVersion
  foxytunesGetFoxyTunesVersion
  foxytunesGetFoxyTunesEMItem
  foxytunesInstallPlatformSpecificLibraryIfNeeded
  foxytunesRemoveRegistryFiles
  foxytunesGetComponentFile
  foxytunesGetHome
  foxytunesGetProfileDir
  foxytunesInsertPlayersMenuItem
  foxytunesInitVolumeSlider
  foxytunesRegisterVolumeSliderEvents
  foxytunesRegisterGlobalScrollEvent
  foxytunesSetPlayerOptionsCustom
  foxytunesSetPlayerOptionsPreset
  foxytunesSetPlayerOptions
  foxytunesDoPlayerSpecificUIChanges
  foxytunesSubscribeToNewsletter
  foxytunesOpenConfigureShortcutsDialog
  foxytunesInitKeyboardShortcuts
  foxytunesOverrideKeyIfNeeded
  foxytunesGetAllKeys
  foxytunesOpenFoxyTunesAboutDialog
  foxytunesToggleAllButtonsVisibility
  foxytunesAllButtonsMouseOut
  foxytunesAllButtonsMouseOver
  foxytunesAllButtonsAutoHideIsOn
  foxytunesToggleVolumeSliderVisibility
  foxytunesToggleButtonVisibility
  foxytunesToggleSeparatorsVisibility
  foxytunesToggleOpenWindowInTab
  foxytunesToggleURLUnescapeTitle
  foxytunesToggleObjectVisibilityWithArrow
  foxytunesScrollOnVolumeControls
  foxytunesDecreaseVolume
  foxytunesIncreaseVolume
  foxytunesRefreshVolumeSliderIfDirty
  foxytunesRefreshVolumeSliderPosition
  foxytunesVolumeSliderPositionDirty
  foxytunesSetVolumeSliderPosition
  foxytunesVolumeSliderChanged
  foxytunesEndTrackInfoTooltip
  foxytunesStartTrackInfoTooltip
  foxytunesHideTrackInfoPopup
  foxytunesShowTrackInfoPopup
  foxytunesTriggerShowTrackInfoPopup
  foxytunesCancelShowTrackInfoPopup
  foxytunesHideTrackInfoBox
  foxytunesTriggerHideTrackInfoBox
  foxytunesCancelHideTrackInfoBox
  foxytunesShowTrackInfoBox
  foxytunesHideAllPopups
  foxytunesHideAllPopupsByType
  foxytunesSetTrackInfoTooltip
  foxytunesGetTrackInfoTooltipText
  foxytunesSetCurrentTrackPosition
  foxytunesUpdatePlanetTooltip
  foxytunesGetCurrentTrackItem
  foxytunesGetCurrentTrackTitle
  foxytunesGetCurrentTrackData
  foxytunesGetVolume
  foxytunesSetVolume
  foxytunesVerifyWMPStartPlaying
  foxytunesDispatchPlayerCommand
  foxytunesUpdateTrackTitleAfterCommand
  foxytunesInitPlayerObjectIfNeeded
  foxytunesSelectPlayer
  foxytunesUpdateRecentPlayer
  foxytunesOnSelectPlayer
  foxytunesReadPreferences
  foxytunesWritePreferences
  foxytunesUpdateRecentCharsetsList
  foxytunesSelectCharset
  foxytunesPopulateRecentCharsets
  foxytunesAddRecentCharSet
  foxytunesTrimRecentCharSets
  foxytunesGetCharSetMenuItem
  foxytunesPopulatePlayers
  foxytunesConfigureCurrentPlayer
  foxytunesOnPlayerListShowing
  foxytunesPopulateCharacterEncodings
  foxytunesCompareCharSets
  gFoxyTunesTimeTools
  FoxyTunesTimeTools
  gFoxyTunesTrackInfoDisplayAutohideTimerID
  gFoxyTunesResizeInitialWidth
  gFoxyTunesResizeStartX
  gbFoxyTunesTrackPressing
  gFoxyTunesTrackTitleQueryInterval
  gFoxyTunesTrackTitleDisplayTimerID
  foxytunesTrackTitleDragStartObserver
  foxytunesTrackTitleDisplayResizeMove
  foxytunesTrackTitleDisplayResizeUp
  foxytunesTrackTitleDisplayResizeDown
  foxytunesTrackTitleToggleAlignment
  foxytunesTrackTitleHideGotoPlanetButton
  foxytunesTrackToggleSeekSlider
  foxytunesTrackTitleToggleScrolling
  foxytunesTrackTitleCopyToClipBoard
  foxytunesToggleTrackTitleDisplayVisibility
  foxytunesTrackTitleAutoHideIsOn
  foxytunesTrackInfoDisplayMouseOut
  foxytunesTrackInfoDisplayMouseOver
  foxytunesTrackTitleDisplayVisibile
  foxytunesSetCurrentTrackTitleLabel
  foxytunesTrackTitleLabelUpdater
  foxytunesUpdateTrackPositionMarker
  foxytunesUpdateTrackTitleLabel
  foxytunesInitTrackTitleLabel
  foxytunesGetTrackInfoLabelElement
  gFoxyTunesCurrentDropTarget
  foxytunesSetFoxyTunesPosition
  foxytunesRenameTagName
  foxyTargetObserver
  foxyDragStartObserver
  foxytunesOnTargetDragDrop
  foxytunesOnTargetDragExit
  foxytunesOnTargetDragOver
  foxytunesSetDropTargetMarker
  foxytunesElementIsToolbarOrStatusbar
  foxytunesRemoveDropClass
  foxytunesHasDropClass
  foxytunesUnInstallDragDropObservers
  foxytunesInstallDragDropObservers
  foxytunesInstallUninstallDragDropObservers
  foxytunesInstallDragDropObserversForElementById
  foxytunesInclude
  gFoxyTunesIncludeRegistry
  foxytunesGetExtensionVersion
  foxytunesOpenSignatuensConfigurationWindow
  foxytunesGetLocaleStringExternalfunction
  foxytunesGetDefaultPlayerForOs
  foxytunesMd5
  foxytunesGetIconPath
  foxytunesGetExtensionPath
  foxytunesEscapeNonAsciiText
  foxytunesPrefToUIElements
  foxytunesUIElementToPref
  gFoxytunesPreferenceManager
  foxytunesPreferenceManager
  foxytunesShowBalloonHelpWithTip
  foxytunesShowBalloonHelp
  foxytunesGetMostRecentWindow
  foxytunesGetBaseWindow
  foxytunesFixLocalStore
  foxytunesDoAndHidePleaseWait
  foxytunesGetAppName
  foxytunesGetAppVersion
  foxytunesGetPlatform
  foxytunesGetPlatformFull
  foxytunesGetDefaultBrowserIcon
  foxytunesGetDefaultBrowserLocation
  foxytunesReadRegistryValue
  foxytunesInitMenupopups
  foxytunesCloseLastContextMenu
  gFoxyTunesLastMenu
  foxytunesSeconds2TimeStr
  foxytunesIsNumber
  foxytunesTryGetFoxyTunesPlayerFromContractID
  foxytunesGetPlayerShortNameFromContractID
  foxytunesIsInMinimode
  foxytunesWindowIsMinimode
  foxytunesWindowIsMinibrowser
  foxytunesClearMenupopup
  foxytunesSanitizeURL
  foxytunesGetClippedText
  foxytunesGetSelection
  foxytunesGetTextFromClipboard
  foxytinesTrimString
  foxytunesShortcutsEnabledByDefault
  foxytunesReadSinglePreference
  foxytunesReadSingleUnicharPreference
  foxytunesWriteSingleUnicharPreference
  foxytunesWriteSinglePreference
  foxytunesGetLocaleString
  foxytunesStringPadRight
  foxytunesShowPrompt
  foxytunesShowAlert
  foxytunesShowAlertWithDelay
  foxytunesOpenInTabs
  foxytunesGoToURL
  foxytunesEmusicGoToUrl
  foxytunesShouldOpenWindowsInTabs
  foxytunesGetEmusicWindow
  foxytunesGetBrowserWindow
  foxytunesRaiseBrowserWindow
  foxytunesGotoPlanet
  foxytunesGetPlanetUrl
  foxytunesOpenBrowserWindow
  gFoxyTunesSanitizer
  foxytunesSanitizer
  foxytunesGetMinibrowserURL
  foxytunesCalculateMinibrowserPosition
  foxytunesShouldUseMinibrowser
  foxytunesLaunchExternalURL
  foxytunesLaunchExternalURLFromThunderbird
  foxytunesAdjustStringForCorrectHost
  getFoxyTunesPlanetBaseURL
  foxytunesIsInEmusic
  foxytunesIsInMozilla
  foxytunesIsInThunderbird
  foxytunesIsInFirefox
  foxytunesIsInIceweasel
  foxytunesIsInMineField
*/

// vim:sw=2 ts=2 et si fdm=marker:
