{
  description = "Docling Python service";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    systems.url = "github:nix-systems/default";
  };

  outputs =
    {
      self,
      systems,
      nixpkgs,
      ...
    }:
    let
      eachSystem =
        f:
        nixpkgs.lib.genAttrs (import systems) (
          system:
          f {
            pkgs = import nixpkgs {
              inherit system;
              config = {
                allowUnfree = true;
              };
            };
          }
        );
    in
    {
      devShells = eachSystem (
        { pkgs }:
        {
          default = pkgs.mkShell {
            shellHook = ''
              echo "Python docling dev environment"
              echo "uv - $(${pkgs.uv}/bin/uv --version)"
            '';
            packages = with pkgs; [
              uv
              python311
            ];
          };
        }
      );
    };
}
