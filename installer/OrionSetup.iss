#define MyAppName "Orion"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Domonkos"
#define MyAppURL "https://github.com/"
#define MyAppExeName "start.bat"

#ifndef RepoRoot
  #define RepoRoot ".."
#endif

[Setup]
AppId={{9ED02365-F903-4749-A49A-D0A2E8558A55}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={localappdata}\Programs\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
InfoBeforeFile={#RepoRoot}\installer\installer-notes.txt
OutputDir={#RepoRoot}\installer\dist
OutputBaseFilename=Orion-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=lowest
UninstallDisplayIcon={app}\{#MyAppExeName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional shortcuts:"

[Files]
Source: "{#RepoRoot}\.env"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#RepoRoot}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: ".git\*,.idea\*,node_modules\*,.venv\*,dist\*,installer\dist\*,test-results\*,playwright-report\*,blob-report\*,*.log"

[Icons]
Name: "{group}\Orion"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"
Name: "{autodesktop}\Orion"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
Filename: "{cmd}"; Parameters: "/c ""{app}\{#MyAppExeName}"""; WorkingDir: "{app}"; Description: "Launch Orion now"; Flags: nowait postinstall skipifsilent

[Code]
procedure InitializeWizard;
begin
  WizardForm.WelcomeLabel2.Caption :=
    'This installer copies the Orion project to your PC and creates shortcuts.' + #13#10#13#10 +
    'On first launch, Orion may install Node.js, Python, and project dependencies automatically.';
end;
