using Pkg
using Pkg.Artifacts
using Pkg.BinaryPlatforms
using SHA
using ArtifactUtils
using Tar
using GZip

if "build" in ARGS
  path = joinpath(homedir(), "Downloads/_all_docs_folder/")
  hash = artifact_from_directory(path)
  tarball_hash = archive_artifact(hash, "npm.tar.gz")
  @show hash, tarball_hash
end

if "bind" in ARGS
  url = "https://github.com/kdheepak/kdheepak.github.io/releases/download/artifacts/npm.tar.gz"
  tarball = download(url)
  hash = bytes2hex(open(sha256, tarball))
  artifact_hash = create_artifact() do artifact_dir
    gzopen(tarball) do unzipped_tar
      Tar.extract(unzipped_tar, artifact_dir)
    end
  end
  artifact_file = joinpath(@__DIR__, "Artifacts.toml")
  isfile(artifact_file) && unbind_artifact!(artifact_file, "npm")
  bind_artifact!(artifact_file, "npm", artifact_hash, download_info=[(url, hash)], force=true)
end
